const axios = require('axios');
const iaService = require('./ia.service');

class IaController {
  // 1. Monitoramento de Status (Health Check)
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

  // 2. CORRIGIDO: Nome alterado para bater com o ia.routes.js
  async processarReconhecimento(req, res, next) {
    try {
      const { alunoId, turmaId, disciplinaId, faceScore } = req.body;

      // Repassa os dados recebidos do Python para o processamento de regras do SENAI
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

  // 3. Validação/Onboarding da face
  async validarAluno(req, res, next) {
    try {
      const resultado = await iaService.validarFaceAluno(req.body);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IaController();