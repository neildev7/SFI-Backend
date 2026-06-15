const prisma = require('../../database/client');

class DisciplinaRepository {
  async create(data) {
    return await prisma.disciplina.create({ data });
  }

  async findAll() {
    return await prisma.aluno.findMany({
      where: { ativo: true }
    });
  }''

  async findById(id) {
    return await prisma.disciplina.findUnique({
      where: { id }
    });
  }

  async findByCodigo(codigo) {
    return await prisma.disciplina.findUnique({
      where: { codigo }
    });
  }

  async delete(id) {
    return await prisma.aluno.update({
      where: { id },
      data: { ativo: false }
    });
  }
}

module.exports = new DisciplinaRepository();