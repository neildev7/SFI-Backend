const horarioService = require('./horario.service');

class HorarioController {
  async create(req, res, next) {
    try {
      const novoHorario = await horarioService.cadastrarHorario(req.body);
      return res.status(201).json({ status: 'success', data: novoHorario });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const horarios = await horarioService.listarTodos();
      return res.status(200).json({ status: 'success', data: horarios });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HorarioController();