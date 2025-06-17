const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrair o token do header (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário no banco de dados
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          verificado: true,
          fotoPerfil: true,
          telefone: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      if (!user.verificado) {
        return res.status(403).json({ message: 'Email não verificado' });
      }

      // Adicionar usuário ao objeto da requisição
      req.user = user;

      // Verificar se o token está na lista negra
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { token }
      });

      if (blacklistedToken) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se o usuário está autenticado, mas não bloquear acesso
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          verificado: true,
          fotoPerfil: true,
          telefone: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignorar erros de token e continuar sem usuário autenticado
      console.warn('Erro ao verificar token opcional:', error);
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next();
  }
};

// Middleware para verificar refresh token
const refreshTokenAuth = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token não fornecido' });
    }

    try {
      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Verificar se o refresh token existe no banco
      const savedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          usuarioId: decoded.id,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!savedToken) {
        return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
      }

      // Buscar usuário
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          nome: true,
          role: true,
          verificado: true,
          fotoPerfil: true,
          telefone: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      req.user = user;
      req.refreshToken = refreshToken;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh token expirado' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro no middleware de refresh token:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissões específicas
const checkPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userPermissions = await prisma.permissao.findMany({
        where: { usuarioId: req.user.id }
      });

      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.some(p => p.nome === permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({ message: 'Permissões insuficientes' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  refreshTokenAuth,
  checkPermissions
};
