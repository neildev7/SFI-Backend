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
      const alunos = await alunoService.listarAlunos();
      return res.status(200).json({ status: 'success', data: alunos });
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