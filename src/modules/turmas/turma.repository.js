const prisma = require('../../database/client');

class TurmaRepository {
  async create(data) {
    return await prisma.turma.create({ data });
  }

  async findAll() {
    return await prisma.turma.findMany();
  }

  async findById(id) {
    return await prisma.turma.findUnique({
      where: { id }
    });
  }

  // Traz a turma e inclui os dados dos alunos vinculados através da tabela pivô (TurmaAluno)
  async findTurmaComAlunos(id) {
    return await prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: {
          include: {
            aluno: true // Traz as informações completas do aluno
          }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.turma.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.turma.delete({
      where: { id }
    });
  }
}

module.exports = new TurmaRepository();