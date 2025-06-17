const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    // Configuração do transporte SMTP (exemplo com Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
};
