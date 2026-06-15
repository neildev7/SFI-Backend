const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');
const enviarEmail = require('../utils/email');
const presencaService = require('../modules/presencas/presenca.service');
const relatorioService = require('../modules/relatorios/relatorio.service');

const iniciarCronJobs = () => {

  // 1. FALTAS AUTOMÁTICAS: Todo dia útil (Seg-Sex) às 23h00 (A gente já tinha, chupa Claude!)
  cron.schedule('0 23 * * 1-5', async () => {
    try {
      await presencaService.processarFaltasAutomaticasDoDia();
      logger.info('🤖 [CRON] Faltas automáticas processadas.');
    } catch (error) {
      logger.error('🚨 [CRON] Erro nas faltas automáticas: ' + error.message);
    }
  });

  // 2. RELATÓRIO DA COZINHA: Todo dia útil (Seg-Sex) às 06h00
  cron.schedule('0 6 * * 1-5', async () => {
    try {
      const relatorio = await relatorioService.previsaoCozinha();
      const texto = `Bom dia equipe da Cozinha!\nPrevisão de alunos para hoje:\nManhã: ${relatorio.previsao.MANHA}\nTarde: ${relatorio.previsao.TARDE}\nNoite: ${relatorio.previsao.NOITE}\nTotal: ${relatorio.previsao.TOTAL}`;
      
      await enviarEmail('cozinha.lorena@sp.senai.br', '🍽️ Previsão de Refeições do Dia', texto);
      logger.info('🤖 [CRON] Relatório da cozinha enviado.');
    } catch (error) {
      logger.error('🚨 [CRON] Erro no relatório da cozinha: ' + error.message);
    }
  });

  // 3. ALERTA DE BAIXA FREQUÊNCIA: Toda Sexta-feira às 18h00
  cron.schedule('0 18 * * 5', async () => {
    try {
      // Puxa a lista da galera abaixo de 75%
      const alunosEmRisco = await relatorioService.listarAlunosBaixaFrequencia(75);
      if (alunosEmRisco.length > 0) {
        const nomes = alunosEmRisco.map(a => `- ${a.nome} (${a.frequencia}%)`).join('\n');
        await enviarEmail('secretaria.lorena@sp.senai.br', '⚠️ Alerta Semanal: Alunos em Risco de Retenção', `Os seguintes alunos estão com frequência abaixo de 75%:\n\n${nomes}`);
      }
      logger.info('🤖 [CRON] Alertas semanais de frequência enviados.');
    } catch (error) {
      logger.error('🚨 [CRON] Erro no alerta semanal: ' + error.message);
    }
  });

  // 4. RELATÓRIO MENSAL CONSOLIDADO: Todo dia 28 às 08h00
  cron.schedule('0 8 28 * *', async () => {
    try {
      await enviarEmail('diretoria.lorena@sp.senai.br', '📊 Fechamento Mensal de Frequência', 'O relatório consolidado do mês já está disponível no painel administrativo para exportação em PDF/CSV.');
      logger.info('🤖 [CRON] Aviso de relatório mensal enviado.');
    } catch (error) {
      logger.error('🚨 [CRON] Erro no aviso mensal: ' + error.message);
    }
  });

  // 5. BACKUP AUTOMÁTICO DO BANCO DE DADOS: Todo dia às 02h00 da madrugada
  cron.schedule('0 2 * * *', () => {
    const fileName = `backup_senai_${Date.now()}.sql`;
    const backupPath = path.join(__dirname, '../../backups', fileName);
    
    // Comando do PostgreSQL para fazer o dump (exige que o pg_dump esteja instalado no servidor de produção)
    const dbUrl = process.env.DATABASE_URL;
    const comando = `pg_dump "${dbUrl}" > "${backupPath}"`;

    exec(comando, (error) => {
      if (error) {
        logger.error(`🚨 [CRON BACKUP] Falha ao fazer backup do DB: ${error.message}`);
        return;
      }
      logger.info(`💾 [CRON BACKUP] Backup realizado com sucesso: ${fileName}`);
    });
  });

  logger.info('⏰ [CRON HUB] Todos os agendamentos (Cozinha, Relatórios, Backup) ativados.');
};

module.exports = iniciarCronJobs;