const prisma = require('../../database/client');
const dayjs = require('dayjs');

class RelatorioRepository {
  async contarPresencasPorPeriodo(inicio, fim) {
    return await prisma.presenca.count({
      where: {
        dataHora: {
          gte: inicio,
          lte: fim
        },
        status: 'PRESENTE'
      }
    });
  }

  async buscarFrequenciaAgrupadaPorTurma(inicio, fim) {
    // Busca todas as presenças do período e inclui os dados da turma
    const presencas = await prisma.presenca.findMany({
      where: {
        dataHora: {
          gte: inicio,
          lte: fim
        },
        status: 'PRESENTE'
      },
      include: { turma: true }
    });

    // Agrupa os resultados por turma no próprio JavaScript
    const resultadoAgrupado = presencas.reduce((acc, presenca) => {
      const nomeTurma = presenca.turma.nome;
      if (!acc[nomeTurma]) acc[nomeTurma] = 0;
      acc[nomeTurma]++;
      return acc;
    }, {});

    return resultadoAgrupado;
  }
}

module.exports = new RelatorioRepository();