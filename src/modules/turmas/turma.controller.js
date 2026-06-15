const turmaService = require('./turma.service');

class TurmaController {
  async create(req, res, next) {
    try {
      // Zod já validou o nome e o anoLetivo!
      const { nome, anoLetivo } = req.body;
      const novaTurma = await turmaService.createTurma({ nome, anoLetivo });
      return res.status(201).json({ status: 'success', data: novaTurma });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const turmas = await turmaService.listarTurmas();
      return res.status(200).json({ status: 'success', data: turmas });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const turma = await turmaService.buscarTurmaPorId(req.params.id);
      return res.status(200).json({ status: 'success', data: turma });
    } catch (error) {
      next(error);
    }
  }

  async getAlunos(req, res, next) {
    try {
      const alunos = await turmaService.listarAlunosDaTurma(req.params.id);
      return res.status(200).json({ status: 'success', data: alunos });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const turmaAtualizada = await turmaService.atualizarTurma(req.params.id, req.body);
      return res.status(200).json({ status: 'success', data: turmaAtualizada });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await turmaService.deletarTurma(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TurmaController();