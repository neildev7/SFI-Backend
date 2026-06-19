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
    const whereClause = {};
    if (dataInicio || dataFim) {
      whereClause.dataHora = {};
      if (dataInicio) whereClause.dataHora.gte = new Date(dataInicio);
      if (dataFim) whereClause.dataHora.lte = new Date(dataFim);
    }

    // 1 QUERY APENAS: Traz a contagem de faltas/presenças de TODOS os alunos de uma vez
    const contagens = await prisma.presenca.groupBy({
      by: ['alunoId', 'status'],
      where: whereClause,
      _count: { _all: true }
    });

    // 1 QUERY APENAS: Traz os dados básicos dos alunos ativos
    const alunos = await prisma.aluno.findMany({ 
      where: { ativo: true }, 
      select: { id: true, nome: true, matricula: true } 
    });

    const mapaFrequencia = {};
    alunos.forEach(a => {
      mapaFrequencia[a.id] = { ...a, presentes: 0, ausentes: 0, justificados: 0, atrasos: 0, saidasAntecipadas: 0 };
    });

    // Distribui as contagens do banco na memória do Node (Muito mais rápido!)
    contagens.forEach(item => {
      if (mapaFrequencia[item.alunoId]) {
        const status = item.status;
        const qtd = item._count._all;
        if (status === 'PRESENTE') mapaFrequencia[item.alunoId].presentes = qtd;
        if (status === 'AUSENTE') mapaFrequencia[item.alunoId].ausentes = qtd;
        if (status === 'JUSTIFICADO') mapaFrequencia[item.alunoId].justificados = qtd;
        if (status === 'ATRASO') mapaFrequencia[item.alunoId].atrasos = qtd;
        if (status === 'SAIDA_ANTECIPADA') mapaFrequencia[item.alunoId].saidasAntecipadas = qtd;
      }
    });

    const alunosEmRisco = [];

    // Calcula a porcentagem sem bater no banco de dados
    for (const alunoId in mapaFrequencia) {
      const dados = mapaFrequencia[alunoId];
      const total = dados.presentes + dados.ausentes + dados.justificados + dados.atrasos + dados.saidasAntecipadas;
      let frequencia = 100.0;

      if (total > 0) {
        frequencia = ((dados.presentes + dados.justificados + dados.atrasos + dados.saidasAntecipadas) / total) * 100;
      }

      if (frequencia < Number(limiar)) {
        alunosEmRisco.push({
          alunoId,
          nome: dados.nome,
          matricula: dados.matricula,
          frequencia: Number(frequencia.toFixed(2)),
          statusRisco: 'EM_RISCO'
        });
      }
    }

    return alunosEmRisco.sort((a, b) => a.frequencia - b.frequencia);
  }
}

module.exports = new RelatorioService();