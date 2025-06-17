require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { rateLimit } = require('express-rate-limit');
const winston = require('winston');
const vhost = require('vhost');

// Import das aplicações específicas
const adminApp = require('./admin-server');
const clientApp = require('./app-server');

// Configuração do Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Configurações básicas
app.set('trust proxy', 1);

// Middlewares de segurança e otimização
app.use(helmet());
app.use(cors({
  origin: [
    'https://siqueiracamposimoveis.com.br',
    'https://admin.siqueiracamposimoveis.com.br',
    'https://app.siqueiracamposimoveis.com.br'
  ],
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});
app.use(limiter);

// Configuração dos subdomínios
app.use(vhost('admin.siqueiracamposimoveis.com.br', adminApp));
app.use(vhost('app.siqueiracamposimoveis.com.br', clientApp));

// Rota padrão para o domínio principal
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API da Siqueira Campos Imóveis' });
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'Main server is running' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message 
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Inicialização do servidor
const subdomains = require('./config/subdomains');

// Iniciar servidores para cada subdomínio
const startServers = () => {
  // Servidor Admin
  const adminServer = adminApp.listen(subdomains.admin.port, () => {
    logger.info(`Servidor Admin rodando na porta ${subdomains.admin.port}`);
    console.log(`Servidor Admin rodando em ${subdomains.admin.domain}:${subdomains.admin.port}`);
  });

  // Servidor App Cliente
  const appServer = clientApp.listen(subdomains.app.port, () => {
    logger.info(`Servidor App Cliente rodando na porta ${subdomains.app.port}`);
    console.log(`Servidor App Cliente rodando em ${subdomains.app.domain}:${subdomains.app.port}`);
  });

  // Servidor Principal
  const mainServer = app.listen(subdomains.main.port, () => {
    logger.info(`Servidor Principal rodando na porta ${subdomains.main.port}`);
    console.log(`Servidor Principal rodando em ${subdomains.main.domain}:${subdomains.main.port}`);
    console.log('\nSubdomínios configurados:');
    Object.values(subdomains).forEach(({ domain, port, description }) => {
      console.log(`- ${domain} (${description}) na porta ${port}`);
    });
  });

  // Tratamento de erros para cada servidor
  [adminServer, appServer, mainServer].forEach((server, index) => {
    server.on('error', (error) => {
      const serverType = ['Admin', 'App Cliente', 'Principal'][index];
      logger.error(`Erro no servidor ${serverType}:`, error);
      process.exit(1);
    });
  });
};

startServers();

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  logger.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Promessa rejeitada não tratada:', err);
  process.exit(1);
});

module.exports = app;
