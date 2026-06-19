const justificativaService = require('./justificativa.service');

class JustificativaController {
  async create(req, res, next) {
    try {
      // Pega o ID da falta que vem na URL (ex: POST /api/v1/presencas/123/justificar)
      const presencaId = req.params.presencaId;
      const { motivo, anexoUrl } = req.body;
      
      const usuarioLogadoId = req.usuario.id; // Pegando do token JWT

      const resultado = await justificativaService.registrarJustificativa(
        { presencaId, motivo, anexoUrl }, 
        usuarioLogadoId
      );

      return res.status(201).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JustificativaController();