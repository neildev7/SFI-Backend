require('dotenv-safe').config();
const app = require('./app');
const logger = require('./utils/logger'); 
const iniciarCronJobs = require('./cron'); // Mantemos apenas o nosso HUB centralizado

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  
  // Inicia a nossa central de robôs em background (Cozinha, Faltas, Backups)
  iniciarCronJobs(); 
  
  logger.info('⏳ Central de Cron Jobs ativada com sucesso.');
});

// Tratamento de interrupções para desligar o servidor de forma limpa (Graceful Shutdown)
process.on('SIGTERM', () => {
  logger.info('Sinal SIGTERM recebido. Desligando o servidor...');
  server.close(() => {
    logger.info('Processo finalizado.');
  });
});