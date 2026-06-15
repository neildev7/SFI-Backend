const alunoService = require('./aluno.service');

class AlunoController {
  async create(req, res, next) {
    try {
      // O Zod já garantiu que nome e matrícula existem e estão corretos!
      const { nome, matricula } = req.body;
      const novoAluno = await alunoService.createAluno({ nome, matricula });
      return res.status(201).json({ status: 'success', data: novoAluno });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      // Pega os parâmetros da URL. Se o Miguel não mandar nada, o padrão é página 1, 10 itens.
      const pagina = req.query.page || 1;
      const limite = req.query.limit || 10;

      const resultado = await alunoService.listarAlunos(pagina, limite);
      
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const aluno = await alunoService.buscarAlunoPorId(req.params.id);
      return res.status(200).json({ status: 'success', data: aluno });
    } catch (error) {
      next(error);
    }
  }

  async getFrequencia(req, res, next) {
    try {
      const estatisticas = await alunoService.calcularFrequenciaPercentual(req.params.id);
      return res.status(200).json({ status: 'success', data: estatisticas });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const alunoAtualizado = await alunoService.atualizarAluno(req.params.id, req.body);
      return res.status(200).json({ status: 'success', data: alunoAtualizado });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await alunoService.deletarAluno(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlunoController();