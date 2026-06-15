const prisma = require('../../database/client');

class DisciplinaRepository {
  async create(data) {
    return await prisma.disciplina.create({ data });
  }

  // CORRIGIDO: Busca apenas disciplinas ativas
  async findAll() {
    return await prisma.disciplina.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' } // De brinde: já devolve em ordem alfabética pro Miguel!
    });
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

  // CORRIGIDO: Soft delete na tabela de disciplinas
  async delete(id) {
    return await prisma.disciplina.update({
      where: { id },
      data: { ativo: false }
    });
  }
}

module.exports = new DisciplinaRepository();