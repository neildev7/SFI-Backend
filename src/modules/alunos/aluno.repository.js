const prisma = require('../../database/client');

class AlunoRepository {
  async create(data) {
    return await prisma.aluno.create({ data });
  }

  // Modificamos para receber a página atual e o limite de itens por página
  async findAll(pagina = 1, limite = 10) {
    const skip = (pagina - 1) * limite; // Quantos registros pular
    const take = Number(limite); // Quantos registros pegar

    // Faz as duas consultas em paralelo para ficar mais rápido
    const [alunos, total] = await prisma.$transaction([
      prisma.aluno.findMany({
        where: { ativo: true },
        skip,
        take,
        orderBy: { nome: 'asc' } // Já devolve em ordem alfabética!
      }),
      prisma.aluno.count({
        where: { ativo: true }
      })
    ]);

    // Calcula o total de páginas
    const totalPaginas = Math.ceil(total / take);

    return {
      dados: alunos,
      meta: {
        total,
        paginaAtual: Number(pagina),
        totalPaginas,
        itensPorPagina: take
      }
    };
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
    return await prisma.aluno.update({
      where: { id },
      data: { ativo: false }
    });
  }
}

module.exports = new AlunoRepository();