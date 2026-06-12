const presencaService = require('./presenca.service');

class PresencaController {
  async create(req, res, next) {
    try {
      // O Zod já validou se os IDs são UUIDs autênticos e se o status está correto
      const { alunoId, turmaId, disciplinaId, status } = req.body;

      const novaPresenca = await presencaService.registrarPresencaManual({
        alunoId,
        turmaId,
        disciplinaId,
        status 
      });

      return res.status(201).json({ status: 'success', data: novaPresenca });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const presencas = await presencaService.listarTodas();
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async getByAluno(req, res, next) {
    try {
      const presencas = await presencaService.listarPorAluno(req.params.id);
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async getByTurma(req, res, next) {
    try {
      const presencas = await presencaService.listarPorTurma(req.params.id);
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async getHoje(req, res, next) {
    try {
      const presencas = await presencaService.listarPresencasHoje();
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PresencaController();