const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middlewares/validationMiddleware');
const { loginLimiter, createAccountLimiter, resetPasswordLimiter } = require('../middlewares/securityMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/login', loginLimiter, validate(schemas.login), authController.login);
router.post('/register', createAccountLimiter, validate(schemas.register), authController.register);
router.post('/forgot-password', resetPasswordLimiter, validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(schemas.resetPassword), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Rotas do Google OAuth
router.post('/google', authController.loginWithGoogle);
router.get('/google/callback', authController.googleCallback);

// Rotas protegidas
router.use(authMiddleware); // Middleware de autenticação para todas as rotas abaixo

router.get('/me', authController.getMe);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.put('/profile', validate(schemas.updateProfile), authController.updateProfile);
router.put('/change-password', validate(schemas.changePassword), authController.changePassword);

// Rota para verificar status da sessão
router.get('/check-session', (req, res) => {
  res.json({ 
    isAuthenticated: true,
    user: req.user
  });
});

// Rota para reenviar email de verificação
router.post('/resend-verification', loginLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    await authController.resendVerificationEmail(email);
    res.json({ message: 'Email de verificação reenviado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para validar token de redefinição de senha
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await authController.validateResetToken(token);
    res.json({ valid: true });
  } catch (error) {
    res.status(400).json({ valid: false, message: error.message });
  }
});

// Rota para obter dados do usuário atual com informações adicionais
router.get('/profile', async (req, res) => {
  try {
    const profile = await authController.getFullProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para atualizar preferências de notificação
router.put('/notification-preferences', async (req, res) => {
  try {
    const preferences = await authController.updateNotificationPreferences(
      req.user.id,
      req.body
    );
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para obter histórico de atividades
router.get('/activity-history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const history = await authController.getActivityHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para vincular conta do Google
router.post('/link-google', async (req, res) => {
  try {
    const { googleToken } = req.body;
    await authController.linkGoogleAccount(req.user.id, googleToken);
    res.json({ message: 'Conta do Google vinculada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para desvincular conta do Google
router.post('/unlink-google', async (req, res) => {
  try {
    await authController.unlinkGoogleAccount(req.user.id);
    res.json({ message: 'Conta do Google desvinculada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para excluir conta
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;
    await authController.deleteAccount(req.user.id, password);
    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
