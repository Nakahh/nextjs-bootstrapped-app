const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Definição de níveis de acesso para diferentes roles
const accessLevels = {
  admin: 3,
  corretor: 2,
  cliente: 1,
  visitante: 0
};

// Middleware para verificar role específica
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      // Verificar se o usuário tem uma das roles permitidas
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar nível mínimo de acesso
const checkAccessLevel = (minimumLevel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      const userAccessLevel = accessLevels[req.user.role] || 0;

      if (userAccessLevel < minimumLevel) {
        return res.status(403).json({ message: 'Nível de acesso insuficiente' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar nível de acesso:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar propriedade do recurso
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ message: 'ID do recurso não fornecido' });
      }

      let resource;
      switch (resourceType) {
        case 'imovel':
          resource = await prisma.imovel.findUnique({
            where: { id: resourceId }
          });
          break;
        case 'visita':
          resource = await prisma.visita.findUnique({
            where: { id: resourceId }
          });
          break;
        case 'favorito':
          resource = await prisma.favorito.findUnique({
            where: { id: resourceId }
          });
          break;
        case 'mensagem':
          resource = await prisma.mensagem.findUnique({
            where: { id: resourceId }
          });
          break;
        case 'artigo':
          resource = await prisma.artigo.findUnique({
            where: { id: resourceId }
          });
          break;
        default:
          return res.status(400).json({ message: 'Tipo de recurso inválido' });
      }

      if (!resource) {
        return res.status(404).json({ message: 'Recurso não encontrado' });
      }

      // Verificar propriedade ou nível de acesso
      const isOwner = resource.usuarioId === req.user.id;
      const hasAdminAccess = req.user.role === 'admin';
      const hasCorretorAccess = req.user.role === 'corretor' && 
        ['imovel', 'visita'].includes(resourceType);

      if (!isOwner && !hasAdminAccess && !hasCorretorAccess) {
        return res.status(403).json({ message: 'Acesso não autorizado ao recurso' });
      }

      // Adicionar o recurso ao objeto da requisição
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erro ao verificar propriedade do recurso:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar permissões específicas
const checkPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      const userPermissions = await prisma.permissao.findMany({
        where: {
          usuarioId: req.user.id
        }
      });

      const hasPermission = permissions.every(permission =>
        userPermissions.some(p => p.nome === permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Permissões insuficientes' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

// Middleware para verificar restrições de horário
const checkTimeRestriction = (startHour, endHour) => {
  return (req, res, next) => {
    const currentHour = new Date().getHours();

    if (currentHour < startHour || currentHour >= endHour) {
      return res.status(403).json({
        message: `Esta operação só pode ser realizada entre ${startHour}h e ${endHour}h`
      });
    }

    next();
  };
};

// Middleware para verificar limites de uso
const checkUsageLimit = (limitPerDay) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Não autenticado' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageCount = await prisma.usuarioAcao.count({
        where: {
          usuarioId: req.user.id,
          acao: req.path,
          createdAt: {
            gte: today
          }
        }
      });

      if (usageCount >= limitPerDay) {
        return res.status(429).json({
          message: `Limite diário de ${limitPerDay} operações atingido`
        });
      }

      // Registrar a ação
      await prisma.usuarioAcao.create({
        data: {
          usuarioId: req.user.id,
          acao: req.path
        }
      });

      next();
    } catch (error) {
      console.error('Erro ao verificar limite de uso:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  checkRole,
  checkAccessLevel,
  checkResourceOwnership,
  checkPermissions,
  checkTimeRestriction,
  checkUsageLimit,
  accessLevels
};
