/**
 * Middleware de logging aprimorado para o projeto siqueira-campos-imoveis.
 * Funcionalidades adicionadas:
 * - Correlação de IDs para rastreamento de requisições.
 * - Integração com serviço externo de logs (exemplo: Datadog).
 * - Alertas para erros críticos via webhook.
 */

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { logger } = require('./loggerMiddleware'); // Reutiliza o logger Winston existente

// Middleware para adicionar correlationId a cada requisição
const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
};

// Middleware para enviar logs para serviço externo (exemplo Datadog)
const externalLogTransport = async (logData) => {
  try {
    // Exemplo de envio para Datadog via HTTP API
    await axios.post(process.env.EXTERNAL_LOG_SERVICE_URL, logData, {
      headers: {
        'DD-API-KEY': process.env.DD_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Erro ao enviar log para serviço externo', { error: error.message });
  }
};

// Middleware para alertar erros críticos via webhook
const criticalErrorAlert = async (errorData) => {
  try {
    await axios.post(process.env.CRITICAL_ERROR_WEBHOOK_URL, errorData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Erro ao enviar alerta crítico', { error: error.message });
  }
};

// Middleware principal aprimorado para logging
const enhancedLoggerMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  const correlationId = req.correlationId || uuidv4();
  req.correlationId = correlationId;

  logger.info('Requisição recebida', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  const originalSend = res.send;
  res.send = function (body) {
    res.responseBody = body;
    originalSend.apply(res, arguments);
  };

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const logData = {
      correlationId,
      duration,
      statusCode: res.statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id
    };

    if (res.statusCode >= 500) {
      logger.error('Erro interno do servidor', logData);
      await criticalErrorAlert(logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Erro do cliente', logData);
    } else {
      logger.info('Requisição completada', logData);
    }

    // Enviar log para serviço externo
    await externalLogTransport(logData);
  });

  next();
};

module.exports = {
  correlationIdMiddleware,
  enhancedLoggerMiddleware,
  criticalErrorAlert,
  externalLogTransport
};
