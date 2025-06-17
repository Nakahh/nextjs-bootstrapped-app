/**
 * Middleware de logging utilizando Winston e Prisma.
 * 
 * Funcionalidades:
 * - Logging estruturado de requisições HTTP.
 * - Máscara de dados sensíveis.
 * - Armazenamento de logs em arquivos e banco de dados.
 * - Logging de erros não tratados.
 * - Logging de requisições lentas.
 * 
 * Melhorias sugeridas:
 * - Centralizar logs em serviço externo (ex: ELK, Datadog).
 * - Adicionar alertas para erros críticos.
 * - Melhorar rastreamento de requisições com IDs correlacionados.
 */

const winston = require('winston');
const { format } = require('winston');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuração do Winston
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'siqueira-campos-imoveis' },
  transports: [
    // Logs de erro são salvos em 'error.log'
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Logs de informação são salvos em 'combined.log'
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Adicionar console em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Função para mascarar dados sensíveis
const maskSensitiveData = (body) => {
  const maskedBody = { ...body };
  const sensitiveFields = ['senha', 'password', 'token', 'cartao', 'card'];

  for (const field of sensitiveFields) {
    if (maskedBody[field]) {
      maskedBody[field] = '********';
    }
  }

  return maskedBody;
};

// Função para extrair informações relevantes do request
const getRequestInfo = (req) => {
  return {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    body: maskSensitiveData(req.body),
    query: req.query,
    params: req.params
  };
};

// Middleware principal de logging
const loggerMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Adicionar requestId ao objeto de request para rastreamento
  req.requestId = requestId;

  // Log inicial da requisição
  const requestInfo = getRequestInfo(req);
  logger.info('Requisição recebida', {
    requestId,
    ...requestInfo
  });

  // Interceptar a resposta
  const originalSend = res.send;
  res.send = function(body) {
    res.responseBody = body;
    originalSend.apply(res, arguments);
  };

  // Após a resposta ser enviada
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      duration,
      statusCode: res.statusCode,
      ...requestInfo
    };

    // Log baseado no status da resposta
    if (res.statusCode >= 500) {
      logger.error('Erro interno do servidor', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Erro do cliente', logData);
    } else {
      logger.info('Requisição completada', logData);
    }

    // Salvar log no banco de dados para requisições importantes
    try {
      if (
        req.originalUrl.includes('/api/auth') ||
        req.originalUrl.includes('/api/admin') ||
        res.statusCode >= 400
      ) {
        await prisma.log.create({
          data: {
            level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
            message: `${req.method} ${req.originalUrl}`,
            metadata: logData,
            usuarioId: req.user?.id,
            timestamp: new Date()
          }
        });
      }
    } catch (error) {
      logger.error('Erro ao salvar log no banco de dados', {
        requestId,
        error: error.message
      });
    }
  });

  // Tratamento de erros não capturados
  res.on('error', (error) => {
    logger.error('Erro na resposta', {
      requestId,
      error: error.message,
      stack: error.stack
    });
  });

  next();
};

// Middleware para logging de erros
const errorLogger = (err, req, res, next) => {
  logger.error('Erro não tratado', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    ...getRequestInfo(req)
  });

  next(err);
};

// Middleware para logging de requisições lentas
const slowRequestLogger = (threshold = 1000) => (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > threshold) {
      logger.warn('Requisição lenta detectada', {
        requestId: req.requestId,
        duration,
        ...getRequestInfo(req)
      });
    }
  });

  next();
};

module.exports = {
  logger,
  loggerMiddleware,
  errorLogger,
  slowRequestLogger
};
