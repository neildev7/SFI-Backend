const prisma = require('../../database/client');

class DisciplinaRepository {
  async create(data) {
    return await prisma.disciplina.create({ data });
  }

  async findAll() {
    return await prisma.disciplina.findMany();
  }

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

  async update(id, data) {
    return await prisma.disciplina.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.disciplina.delete({
      where: { id }
    });
  }
}

module.exports = new DisciplinaRepository();