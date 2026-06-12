const cron = require('node-cron');
const relatorioService = require('../modules/relatorios/relatorio.service');
const logger = require('../utils/logger');

// Regra: Roda à meia-noite (23:59) do último dia do mês (expressão cron: '59 23 28-31 * *')
const gerarRelatorioMensal = () => {
  cron.schedule('59 23 28-31 * *', async () => {
    logger.info('Iniciando Job: Geração de Relatório Mensal Consolidado...');
    
    try {
      // Chama o nosso service que já faz toda a matemática complexa
      const relatorio = await relatorioService.gerarRelatorioMensal();

      // Grava no log de sistema para auditoria futura
      logger.info(`Consolidação do Mês de ${relatorio.mes}:`);
      logger.info(JSON.stringify(relatorio.frequenciaPorTurma, null, 2));

      // No futuro, isso poderia gerar um PDF e salvar na nuvem ou enviar por e-mail.

    } catch (error) {
      logger.error(`Erro no Job de Relatório Mensal: ${error.message}`);
    }
  });
};

module.exports = gerarRelatorioMensal;