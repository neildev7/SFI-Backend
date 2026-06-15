const prisma = require('../../database/client');
const dayjs = require('dayjs');

class PresencaRepository {
  async create(data) {
    return await prisma.presenca.create({ 
      data,
      include: { aluno: true, turma: true } 
    });
  }

  // Agora recebe página e limite, com valores padrão (1 e 10)
  async findAll(pagina = 1, limite = 10) {
    const skip = (pagina - 1) * limite;
    const take = Number(limite);

    // Faz a busca dos dados e a contagem total ao mesmo tempo
    const [presencas, total] = await prisma.$transaction([
      prisma.presenca.findMany({
        skip,
        take,
        include: { aluno: true, turma: true },
        orderBy: { dataHora: 'desc' }
      }),
      prisma.presenca.count()
    ]);

    const totalPaginas = Math.ceil(total / take);

    return {
      dados: presencas,
      meta: {
        total,
        paginaAtual: Number(pagina),
        totalPaginas,
        itensPorPagina: take
      }
    };
  }

  async findByAlunoId(alunoId) {
    return await prisma.presenca.findMany({
      where: { alunoId },
      include: { turma: true, disciplina: true },
      orderBy: { dataHora: 'desc' }
    });
  }

  async findByTurmaId(turmaId) {
    return await prisma.presenca.findMany({
      where: { turmaId },
      include: { aluno: true },
      orderBy: { dataHora: 'desc' }
    });
  }

  async findPresencasDeHoje() {
    // Pega o início (00:00:00) e o fim (23:59:59) do dia de hoje
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    return await prisma.presenca.findMany({
      where: {
        dataHora: {
          gte: inicioDoDia,
          lte: fimDoDia
        }
      },
      include: { aluno: true, turma: true },
      orderBy: { dataHora: 'desc' }
    });
  }

  // Novo método para o cálculo de frequência
  // Modificado para aceitar inicio e fim opcionais
  async countByStatusAndAluno(alunoId, dataInicio, dataFim) {
    const whereClause = { alunoId };

    // Se o frontend mandou as datas, nós construímos o filtro dinamicamente
    if (dataInicio || dataFim) {
      whereClause.dataHora = {};
      if (dataInicio) whereClause.dataHora.gte = new Date(dataInicio); // Maior ou igual ao início
      if (dataFim) whereClause.dataHora.lte = new Date(dataFim);       // Menor ou igual ao fim
    }

    return await prisma.presenca.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        _all: true
      }
    });
  }

  // Verifica se o aluno já registrou presença nesta turma no dia de hoje
  async verificarPresencaExistenteHoje(alunoId, turmaId) {
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    const presenca = await prisma.presenca.findFirst({
      where: {
        alunoId,
        turmaId,
        dataHora: {
          gte: inicioDoDia,
          lte: fimDoDia
        }
      }
    });

    return !!presenca; // Retorna true se encontrou, false se não encontrou
  }

  // Busca o registro completo de hoje do aluno na turma (Corrigido com dayjs)
  async buscarPresencaCompletaDeHoje(alunoId, turmaId) {
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    return await prisma.presenca.findFirst({
      where: {
        alunoId,
        turmaId,
        dataHora: { 
          gte: inicioDoDia,
          lte: fimDoDia 
        }
      }
    });
  }

  // Busca o registro completo do aluno em uma disciplina específica no dia de hoje (Corrigido com dayjs)
  async buscarPresencaDeHojePorDisciplina(alunoId, turmaId, disciplinaId) {
    const inicioDoDia = dayjs().startOf('day').toDate();
    const fimDoDia = dayjs().endOf('day').toDate();

    return await prisma.presenca.findFirst({
      where: {
        alunoId,
        turmaId,
        disciplinaId, 
        dataHora: { 
          gte: inicioDoDia,
          lte: fimDoDia 
        }
      }
    });
  }

  // Atualiza apenas o campo de saída
  async registrarSaida(presencaId, novoStatus = null) {
    const dataUpdate = { dataHoraSaida: new Date() };

    // Se o service detetar que foi mais cedo, nós atualizamos o status da presença
    if (novoStatus) {
      dataUpdate.status = novoStatus;
    }

    return await prisma.presenca.update({
      where: { id: presencaId },
      data: dataUpdate
    });
  }
  // 1. Conta presenças agrupadas por disciplina para o relatório por matéria
  async countAgrupadoPorDisciplina(alunoId, dataInicio, dataFim) {
    const whereClause = { alunoId };

    if (dataInicio || dataFim) {
      whereClause.dataHora = {};
      if (dataInicio) whereClause.dataHora.gte = new Date(dataInicio);
      if (dataFim) whereClause.dataHora.lte = new Date(dataFim);
    }

    return await prisma.presenca.groupBy({
      by: ['disciplinaId', 'status'],
      where: whereClause,
      _count: { _all: true }
    });
  }

  // 2. Conta as presenças de todos os alunos de uma turma específica (para o consolidado da secretaria)
  async countConsolidadoPorTurma(turmaId, dataInicio, dataFim) {
    const whereClause = { turmaId };

    if (dataInicio || dataFim) {
      whereClause.dataHora = {};
      if (dataInicio) whereClause.dataHora.gte = new Date(dataInicio);
      if (dataFim) whereClause.dataHora.lte = new Date(dataFim);
    }

    return await prisma.presenca.groupBy({
      by: ['alunoId', 'status'],
      where: whereClause,
      _count: { _all: true }
    });
  }
}

module.exports = new PresencaRepository();