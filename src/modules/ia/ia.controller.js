const iaService = require('./ia.service');

class IaController {

  async checkPythonStatus(req, res) {
    try {
      // Ping rápido de 3 segundos para ver se o Python responde
      const response = await axios.get(`${process.env.PYTHON_API_URL}/health`, { timeout: 3000 });
      return res.status(200).json({ 
        status: 'success', 
        message: 'Conexão com a IA estabelecida.', 
        python_data: response.data 
      });
    } catch (error) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Serviço de reconhecimento facial offline ou inacessível.' 
      });
    }
  }
  async registrarPresenca(req, res, next) {
    try {
      const { alunoId, turmaId, disciplinaId, faceScore } = req.body;

      // Repassa o faceScore recebido do Python para o processamento
      const resultado = await iaService.processarReconhecimento({ 
        alunoId, 
        turmaId, 
        disciplinaId, 
        faceScore 
      });

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