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

  // GET /grade-horaria/turma/:id/agora
  async buscarAulaAtual(req, res, next) {
    try {
      const { id: turmaId } = req.params;
      const dataAtual = new Date();
      const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
      const diaHoje = diasSemana[dataAtual.getDay()];
      
      // Pega a hora e minuto atual (ex: "14:30")
      const horaAtual = dataAtual.toTimeString().substring(0, 5);

      const prisma = require('../../database/client');
      
      // Busca a aula daquela turma, naquele dia, onde o horário bata com o agora
      const aulaAtual = await prisma.horario.findFirst({
        where: {
          turmaId,
          diaSemana: diaHoje,
          horaInicio: { lte: horaAtual },
          horaFim: { gte: horaAtual }
        },
        include: { disciplina: true }
      });

      if (!aulaAtual) {
        return res.status(404).json({ message: 'Nenhuma aula acontecendo neste momento para esta turma.' });
      }

      return res.status(200).json({ status: 'success', data: aulaAtual });
    } catch (error) {
      next(error);
    }
  }
  
}

module.exports = new HorarioController();