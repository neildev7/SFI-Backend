const iaService = require('./ia.service');

class IaController {
  async registrarPresenca(req, res, next) {
    try {
      // O backend Python enviará no corpo (body) o ID do aluno que ele reconheceu na câmera
      const { alunoId, turmaId, disciplinaId } = req.body;

      if (!alunoId || !turmaId) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'alunoId e turmaId são obrigatórios para a IA registrar presença.' 
        });
      }

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