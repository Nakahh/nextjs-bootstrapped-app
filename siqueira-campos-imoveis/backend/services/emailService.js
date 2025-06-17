/**
 * Serviço de envio de emails utilizando Nodemailer com OAuth2 para Gmail.
 * 
 * Funcionalidades:
 * - Envio de email de verificação de conta.
 * - Envio de email de boas-vindas.
 * - Envio de email para redefinição de senha.
 * - Envio de confirmação de visita.
 * 
 * Melhorias sugeridas:
 * - Adicionar suporte a templates dinâmicos com handlebars ou similar.
 * - Implementar fila de envio para evitar bloqueios em picos.
 * - Monitorar falhas e implementar retry automático.
 */

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Configuração do OAuth2 para Gmail
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Criar transporter do Nodemailer com OAuth2
const createTransporter = async () => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_FROM,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });
  } catch (error) {
    console.error('Erro ao criar transporter:', error);
    throw error;
  }
};

// Templates de email
const emailTemplates = {
  verification: (token) => ({
    subject: 'Verifique seu email - Siqueira Campos Imóveis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://siqueiracamposimoveis.com.br/logo.png" alt="Logo" style="max-width: 200px; margin: 20px 0;">
        <h2 style="color: #333;">Bem-vindo à Siqueira Campos Imóveis!</h2>
        <p>Para começar a usar nossos serviços, por favor verifique seu email clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verificar-email/${token}" 
             style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verificar Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          ${process.env.FRONTEND_URL}/verificar-email/${token}
        </p>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 24 horas.
        </p>
      </div>
    `
  }),

  welcome: (nome) => ({
    subject: 'Bem-vindo à Siqueira Campos Imóveis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://siqueiracamposimoveis.com.br/logo.png" alt="Logo" style="max-width: 200px; margin: 20px 0;">
        <h2 style="color: #333;">Olá ${nome}!</h2>
        <p>Seja bem-vindo à Siqueira Campos Imóveis. Estamos muito felizes em ter você conosco!</p>
        <p>Com sua conta, você pode:</p>
        <ul style="color: #666;">
          <li>Favoritar imóveis de seu interesse</li>
          <li>Agendar visitas</li>
          <li>Receber notificações de novos imóveis</li>
          <li>Entrar em contato diretamente com nossos corretores</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/imoveis" 
             style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Começar a Explorar
          </a>
        </div>
      </div>
    `
  }),

  passwordReset: (token) => ({
    subject: 'Redefinição de Senha - Siqueira Campos Imóveis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://siqueiracamposimoveis.com.br/logo.png" alt="Logo" style="max-width: 200px; margin: 20px 0;">
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/redefinir-senha/${token}" 
             style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          ${process.env.FRONTEND_URL}/redefinir-senha/${token}
        </p>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
        </p>
      </div>
    `
  }),

  visitaConfirmada: (visita) => ({
    subject: 'Visita Confirmada - Siqueira Campos Imóveis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://siqueiracamposimoveis.com.br/logo.png" alt="Logo" style="max-width: 200px; margin: 20px 0;">
        <h2 style="color: #333;">Sua visita foi confirmada!</h2>
        <p>Detalhes da visita:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px;">
          <p><strong>Imóvel:</strong> ${visita.imovel.titulo}</p>
          <p><strong>Data:</strong> ${new Date(visita.data).toLocaleDateString('pt-BR')}</p>
          <p><strong>Horário:</strong> ${visita.horario}</p>
          <p><strong>Corretor:</strong> ${visita.corretor.nome}</p>
        </div>
        <p style="margin-top: 20px;">
          Lembre-se de chegar com 10 minutos de antecedência. Em caso de imprevistos, 
          entre em contato conosco.
        </p>
      </div>
    `
  })
};

const emailService = {
  // Enviar email de verificação
  async sendVerificationEmail(email, token) {
    try {
      const transporter = await createTransporter();
      const template = emailTemplates.verification(token);

      await transporter.sendMail({
        from: `"Siqueira Campos Imóveis" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
      throw error;
    }
  },

  // Enviar email de boas-vindas
  async sendWelcomeEmail(email, nome) {
    try {
      const transporter = await createTransporter();
      const template = emailTemplates.welcome(nome);

      await transporter.sendMail({
        from: `"Siqueira Campos Imóveis" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      throw error;
    }
  },

  // Enviar email de redefinição de senha
  async sendPasswordResetEmail(email, token) {
    try {
      const transporter = await createTransporter();
      const template = emailTemplates.passwordReset(token);

      await transporter.sendMail({
        from: `"Siqueira Campos Imóveis" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      throw error;
    }
  },

  // Enviar confirmação de visita
  async sendVisitaConfirmacao(email, visita) {
    try {
      const transporter = await createTransporter();
      const template = emailTemplates.visitaConfirmada(visita);

      await transporter.sendMail({
        from: `"Siqueira Campos Imóveis" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });
    } catch (error) {
      console.error('Erro ao enviar confirmação de visita:', error);
      throw error;
    }
  }
};

module.exports = emailService;
