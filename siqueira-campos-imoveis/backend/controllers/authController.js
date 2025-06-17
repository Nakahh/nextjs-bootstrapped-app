/**
 * Controlador para autenticação via Google OAuth 2.0 e autenticação local.
 * Implementa login, registro, verificação de email, login com Google,
 * recuperação e redefinição de senha, atualização de perfil, logout e refresh token.
 * 
 * Melhorias sugeridas:
 * - Implementar refresh automático do token.
 * - Adicionar logs detalhados para falhas.
 * - Implementar logout seguro invalidando tokens.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const authController = {
  // Login com credenciais
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      if (!user.verificado) {
        return res.status(403).json({ message: 'Email não verificado' });
      }

      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Salvar refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          usuarioId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        }
      });

      // Remover senha do objeto do usuário
      const { senha: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Registro de novo usuário
  async register(req, res) {
    try {
      const { nome, email, senha, telefone } = req.body;

      // Verificar se email já existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 12);

      // Gerar token de verificação
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Criar usuário
      const user = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          telefone,
          role: 'cliente',
          verificado: false,
          tokenVerificacao: verificationToken,
          tokenVerificacaoExpira: tokenExpiry
        }
      });

      // Enviar email de verificação
      await emailService.sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.'
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Verificação de email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await prisma.usuario.findFirst({
        where: {
          tokenVerificacao: token,
          tokenVerificacaoExpira: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      // Atualizar usuário
      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          verificado: true,
          tokenVerificacao: null,
          tokenVerificacaoExpira: null
        }
      });

      // Enviar email de boas-vindas
      await emailService.sendWelcomeEmail(user.email, user.nome);

      res.json({ message: 'Email verificado com sucesso' });
    } catch (error) {
      console.error('Erro na verificação de email:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Login com Google
  async loginWithGoogle(req, res) {
    try {
      const { token } = req.body;

      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const { email, name, picture } = ticket.getPayload();

      let user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
        // Criar novo usuário
        user = await prisma.usuario.create({
          data: {
            email,
            nome: name,
            senha: crypto.randomBytes(32).toString('hex'), // senha aleatória
            verificado: true,
            role: 'cliente',
            googleId: ticket.getUserId(),
            fotoPerfil: picture
          }
        });
      } else if (!user.googleId) {
        // Vincular conta Google a usuário existente
        await prisma.usuario.update({
          where: { id: user.id },
          data: {
            googleId: ticket.getUserId(),
            fotoPerfil: picture
          }
        });
      }

      const authToken = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Salvar refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          usuarioId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      const { senha: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token: authToken,
        refreshToken
      });
    } catch (error) {
      console.error('Erro no login com Google:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Recuperação de senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpira: tokenExpiry
        }
      });

      await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        message: 'Email de recuperação de senha enviado'
      });
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Redefinição de senha
  async resetPassword(req, res) {
    try {
      const { token, novaSenha } = req.body;

      const user = await prisma.usuario.findFirst({
        where: {
          resetToken: token,
          resetTokenExpira: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, 12);

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          senha: hashedPassword,
          resetToken: null,
          resetTokenExpira: null
        }
      });

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Atualização de perfil
  async updateProfile(req, res) {
    try {
      const { nome, telefone } = req.body;
      const userId = req.user.id;

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: {
          nome,
          telefone
        }
      });

      const { senha: _, ...userWithoutPassword } = updatedUser;

      res.json({
        user: userWithoutPassword,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro na atualização do perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      // Remover refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { token: refreshToken },
            { usuarioId: req.user.id }
          ]
        }
      });

      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Refresh Token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      const savedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          usuario: true
        }
      });

      if (!savedToken) {
        return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
      }

      const newToken = generateToken(savedToken.usuario.id, savedToken.usuario.role);
      const newRefreshToken = generateRefreshToken(savedToken.usuario.id);

      // Atualizar refresh token
      await prisma.refreshToken.update({
        where: { id: savedToken.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      res.json({
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Erro no refresh token:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;
