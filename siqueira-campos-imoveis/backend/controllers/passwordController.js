const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Email não encontrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expiration,
      },
    });

    // Configurar transporte SMTP (exemplo com Gmail, ajustar conforme necessário)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Redefinição de senha',
      text: `Você solicitou a redefinição de senha. Clique no link para redefinir: ${resetUrl}`,
      html: `<p>Você solicitou a redefinição de senha.</p><p>Clique no link para redefinir: <a href="${resetUrl}">${resetUrl}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email de redefinição enviado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const senhaHash = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: tokenRecord.userId },
      data: { senha: senhaHash },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
