const prisma = require('../../database/client');
const dayjs = require('dayjs');
const alunoService = require('../alunos/aluno.service'); // Para reaproveitar a matemática de frequência

class RelatorioService {
  // 1. Relatório da Cozinha (Refutando o Claude: O turno vem da relação com a Turma!)
  async previsaoCozinha(dataRef) {
    const dataBusca = dataRef ? dayjs(dataRef) : dayjs();
    const inicioDoDia = dataBusca.startOf('day').toDate();
    const fimDoDia = dataBusca.endOf('day').toDate();

    // Pega todo mundo que marcou presença, chegou atrasado ou saiu mais cedo
    const presencas = await prisma.presenca.findMany({
      where: {
        dataHora: { gte: inicioDoDia, lte: fimDoDia },
        status: { in: ['PRESENTE', 'ATRASO', 'SAIDA_ANTECIPADA'] }
      },
      include: { turma: true } // <--- A mágica da normalização aqui!
    });

    const previsao = { MANHA: 0, TARDE: 0, NOITE: 0, INTEGRAL: 0, TOTAL: 0 };

    presencas.forEach(p => {
      if (p.turma && p.turma.turno) {
        previsao[p.turma.turno]++;
        previsao.TOTAL++;
      }
    });

    return { data: dataBusca.format('YYYY-MM-DD'), previsao };
  }

  // 2. Lista de Ausentes por Dia e Turma
  async listarAusentes(turmaId, dataRef) {
    const dataBusca = dataRef ? dayjs(dataRef) : dayjs();
    const inicioDoDia = dataBusca.startOf('day').toDate();
    const fimDoDia = dataBusca.endOf('day').toDate();

    const faltas = await prisma.presenca.findMany({
      where: {
        turmaId,
        dataHora: { gte: inicioDoDia, lte: fimDoDia },
        status: 'AUSENTE'
      },
      include: { aluno: { select: { id: true, nome: true, matricula: true } } }
    });

    return faltas.map(f => ({
      alunoId: f.aluno.id,
      nome: f.aluno.nome,
      matricula: f.aluno.matricula,
      dataFalta: f.dataHora
    }));
  }

  // 3. Alunos com Baixa Frequência (Filtro Global)
  async listarAlunosBaixaFrequencia(limiar = 75, dataInicio, dataFim) {
    // Pega todos os alunos ativos
    const alunos = await prisma.aluno.findMany({ where: { ativo: true } });
    const alunosEmRisco = [];

    // Para cada aluno, calcula a frequência no período usando nosso motor pronto
    for (const aluno of alunos) {
      const relatorio = await alunoService.calcularFrequenciaPercentual(aluno.id, dataInicio, dataFim);
      
      // Se a frequência for menor que o limiar (ex: 75), entra pra lista vermelha
      if (relatorio.frequenciaPercentual < Number(limiar)) {
        alunosEmRisco.push({
          alunoId: aluno.id,
          nome: aluno.nome,
          matricula: aluno.matricula,
          frequencia: relatorio.frequenciaPercentual,
          statusRisco: relatorio.statusRisco
        });
      }
    }

    // Ordena dos mais faltosos para os menos faltosos
    return alunosEmRisco.sort((a, b) => a.frequencia - b.frequencia);
  }
}

module.exports = new RelatorioService();