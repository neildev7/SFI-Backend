const nodemailer = require('nodemailer');
const logger = require('./logger');

// Usa credenciais falsas (Mailtrap ou Ethereal) se não tiver no .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || "usuario_teste",
    pass: process.env.SMTP_PASS || "senha_teste"
  }
});

const enviarEmail = async (destinatario, assunto, texto) => {
  try {
    await transporter.sendMail({
      from: '"Sistema de Presença SENAI" <no-reply@senai.br>',
      to: destinatario,
      subject: assunto,
      text: texto
    });
    logger.info(`📧 E-mail enviado com sucesso para ${destinatario} - Assunto: ${assunto}`);
  } catch (error) {
    logger.error(`🚨 Falha ao enviar e-mail para ${destinatario}: ${error.message}`);
  }
};

module.exports = enviarEmail;