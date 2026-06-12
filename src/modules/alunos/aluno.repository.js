const prisma = require('../../database/client');

class AlunoRepository {
  async create(data) {
    return await prisma.aluno.create({ data });
  }

  async findAll() {
    return await prisma.aluno.findMany();
  }

  async findById(id) {
    return await prisma.aluno.findUnique({
      where: { id }
    });
  }

  async findByMatricula(matricula) {
    return await prisma.aluno.findUnique({
      where: { matricula }
    });
  }

  async update(id, data) {
    return await prisma.aluno.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.aluno.delete({
      where: { id }
    });
  }
}

module.exports = new AlunoRepository();