const cron = require('node-cron');
const prisma = require('../database/client');
const logger = require('../utils/logger');

// Regra: Roda toda sexta-feira às 18:00 (expressão cron: '0 18 * * 5')
const verificarFaltasExcessivas = () => {
  cron.schedule('0 18 * * 5', async () => {
    logger.info('Iniciando Job: Verificação de faltas excessivas...');
    
    try {
      // Busca todos os alunos e conta quantas presenças com status "AUSENTE" eles têm
      const alunosComFaltas = await prisma.aluno.findMany({
        include: {
          _count: {
            select: {
              presencas: {
                where: { status: 'AUSENTE' }
              }
            }
          }
        }
      });

      // Filtra os alunos que têm mais de 5 faltas acumuladas (exemplo de limite)
      const alunosEmRisco = alunosComFaltas.filter(aluno => aluno._count.presencas >= 5);

      if (alunosEmRisco.length > 0) {
        logger.warn(`ATENÇÃO: ${alunosEmRisco.length} alunos com mais de 5 faltas!`);
        // Aqui, no futuro, poderíamos disparar um e-mail automático para a Secretaria.
        alunosEmRisco.forEach(aluno => {
          logger.info(`Aluno: ${aluno.nome} | Matrícula: ${aluno.matricula} | Faltas: ${aluno._count.presencas}`);
        });
      } else {
        logger.info('Nenhum aluno em risco de reprovação por falta nesta semana.');
      }

    } catch (error) {
      logger.error(`Erro no Job de Faltas Excessivas: ${error.message}`);
    }
  });
};

module.exports = verificarFaltasExcessivas;