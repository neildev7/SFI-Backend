const iaService = require('./ia.service');

class IaController {
  async registrarPresenca(req, res, next) {
    try {
      // O Zod já garantiu que os IDs chegaram no formato correto (UUID)
      const { alunoId, turmaId, disciplinaId } = req.body;

      const resultado = await iaService.processarReconhecimento({ alunoId, turmaId, disciplinaId });

      return res.status(201).json({ 
        status: 'success', 
        message: 'Presença registrada com sucesso pela IA.',
        data: resultado 
      });
    } catch (error) {
      next(error);
    }
  }

  async validarAluno(req, res, next) {
    try {
      // Lógica futura para onboarding/cadastro da face
      const resultado = await iaService.validarFaceAluno(req.body);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IaController();