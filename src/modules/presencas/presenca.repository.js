const prisma = require('../../database/client');
const dayjs = require('dayjs');

class PresencaRepository {
  async create(data) {
    return await prisma.presenca.create({ 
      data,
      include: { aluno: true, turma: true } 
    });
  }

  async findAll() {
    // CORRIGIDO: Voltou a ser prisma.presenca e com as relações certas
    return await prisma.presenca.findMany({
      include: { aluno: true, turma: true },
      orderBy: { dataHora: 'desc' }
    });
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
  async countByStatusAndAluno(alunoId) {
    return await prisma.presenca.groupBy({
      by: ['status'],
      where: { alunoId },
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
}

module.exports = new PresencaRepository();