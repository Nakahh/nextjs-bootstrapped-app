const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuração básica do Helmet
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tailwindcss.com', 'https://accounts.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", 'https://api.googleapis.com'],
      frameSrc: ["'self'", 'https://accounts.google.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Configuração do CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 contas
  message: 'Muitas contas criadas. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas
  message: 'Muitas solicitações de redefinição de senha. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para verificar token na lista negra
const checkBlacklistedToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token }
    });

    if (blacklistedToken) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar token na lista negra:', error);
    next(error);
  }
};

// Middleware para sanitização de dados
const sanitizeData = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Middleware para validar origem da requisição
const validateOrigin = (req, res, next) => {
  const origin = req.get('origin');
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    next();
  } else {
    res.status(403).json({ message: 'Origem não autorizada' });
  }
};

// Middleware para validar content type
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ message: 'Content-Type deve ser application/json' });
    }
  }
  next();
};

// Middleware para prevenir ataques de timing
const preventTimingAttacks = (req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Adicionar delay aleatório para mascarar o tempo real de processamento
    if (duration < 100) {
      const delay = Math.floor(Math.random() * (100 - duration));
      setTimeout(next, delay);
    } else {
      next();
    }
  });
};

// Middleware para validar tamanho do payload
const validatePayloadSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxBytes = parseInt(maxSize) * 1024 * 1024; // Converter para bytes

    if (contentLength > maxBytes) {
      return res.status(413).json({
        message: `Payload muito grande. Máximo permitido: ${maxSize}`
      });
    }
    next();
  };
};

// Middleware para logging de segurança
const securityLogger = async (req, res, next) => {
  try {
    const logEntry = {
      timestamp: new Date(),
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };

    // Registrar log de segurança
    await prisma.securityLog.create({
      data: logEntry
    });

    next();
  } catch (error) {
    console.error('Erro ao registrar log de segurança:', error);
    next();
  }
};

// Configuração do middleware de proteção contra parâmetros de poluição HTTP
const hppConfig = hpp({
  whitelist: [
    'preco',
    'area',
    'quartos',
    'banheiros',
    'vagas',
    'page',
    'limit',
    'sort'
  ]
});

module.exports = {
  helmetConfig,
  corsOptions,
  loginLimiter,
  createAccountLimiter,
  resetPasswordLimiter,
  apiLimiter,
  checkBlacklistedToken,
  sanitizeData,
  validateOrigin,
  validateContentType,
  preventTimingAttacks,
  validatePayloadSize,
  securityLogger,
  hppConfig,
  // Exportar middlewares combinados para uso fácil
  securityMiddleware: [
    helmetConfig,
    cors(corsOptions),
    xss(),
    hppConfig,
    validateOrigin,
    validateContentType,
    validatePayloadSize('10mb'),
    sanitizeData,
    checkBlacklistedToken,
    securityLogger
  ]
};
