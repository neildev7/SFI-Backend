const relatorioRepository = require('./relatorio.repository');
const dayjs = require('dayjs');

class RelatorioService {
  async gerarRelatorioCozinha() {
    // Regra da Cozinha: Contar presenças de hoje, da 00:00 até as 10:00 da manhã
    const inicioDoDia = dayjs().startOf('day').toDate();
    const horarioDeCorte = dayjs().hour(10).minute(0).second(0).toDate();

    const totalRefeicoesEstimadas = await relatorioRepository.contarPresencasPorPeriodo(inicioDoDia, horarioDeCorte);

    return {
      data: dayjs().format('YYYY-MM-DD'),
      horarioDeCorte: '10:00',
      totalRefeicoesEstimadas,
      mensagem: `A cozinha deve preparar ${totalRefeicoesEstimadas} refeições com base nas presenças registradas até as 10h.`
    };
  }

  async gerarRelatorioSecretaria() {
    // Secretaria quer uma visão geral do dia (00:00 às 23:59)
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    const totalPresentesHoje = await relatorioRepository.contarPresencasPorPeriodo(inicioDoDia, fimDoDia);

    return {
      data: dayjs().format('YYYY-MM-DD'),
      totalPresentesHoje
    };
  }

  async gerarRelatorioDiario() {
    // Retorna a contagem de presenças agrupadas por turma no dia de hoje
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    const frequenciaPorTurma = await relatorioRepository.buscarFrequenciaAgrupadaPorTurma(inicioDoDia, fimDoDia);

    return {
      data: dayjs().format('YYYY-MM-DD'),
      frequenciaPorTurma
    };
  }

  async gerarRelatorioMensal() {
    // Pega o primeiro e o último dia do mês atual
    const inicioDoMes = dayjs().startOf('month').toDate();
    const fimDoMes = dayjs().endOf('month').toDate();

    const frequenciaMensalPorTurma = await relatorioRepository.buscarFrequenciaAgrupadaPorTurma(inicioDoMes, fimDoMes);

    return {
      mes: dayjs().format('MMMM/YYYY'),
      frequenciaPorTurma: frequenciaMensalPorTurma
    };
  }
}

module.exports = new RelatorioService();