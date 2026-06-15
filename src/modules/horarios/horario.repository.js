const prisma = require('../../database/client');

class HorarioRepository {
  async create(data) {
    return await prisma.horario.create({ data });
  }

  async findAll() {
    return await prisma.horario.findMany({
      where: { ativo: true },
      include: { turma: true, disciplina: true }
    });
  }

  // Busca a grade horária de uma turma específica para um dia da semana
  async findByTurmaEDia(turmaId, diaSemana) {
    return await prisma.horario.findMany({
      where: {
        turmaId,
        diaSemana,
        ativo: true
      },
      include: { disciplina: true }
    });
  }
}

module.exports = new HorarioRepository();