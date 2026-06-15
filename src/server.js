require('dotenv-safe').config();
const app = require('./app');
const logger = require('./utils/logger'); // Adicionado o nosso novo logger

// Importação dos Jobs
const verificarFaltasExcessivas = require('./jobs/verificarFaltasExcessivas');
const gerarRelatorioMensal = require('./jobs/gerarRelatorioMensal');
const iniciarCronJobs = require('./cron'); // <--- 1. IMPORTAMOS O ROBÔ DA MADRUGADA AQUI

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  
  // Inicia os trabalhos de fundo assim que o servidor sobe
  verificarFaltasExcessivas();
  gerarRelatorioMensal();
  iniciarCronJobs(); // <--- 2. LIGAMOS O ROBÔ NA TOMADA AQUI!
  
  logger.info('⏳ Cron Jobs de background ativados.');
});

// Tratamento de interrupções para desligar o servidor de forma limpa (Graceful Shutdown)
process.on('SIGTERM', () => {
  logger.info('Sinal SIGTERM recebido. Desligando o servidor...');
  server.close(() => {
    logger.info('Processo finalizado.');
  });
});