const { Router } = require('express');
const iaController = require('./ia.controller');
const validateApiKey = require('../../middlewares/validateApiKey');
const validate = require('../../middlewares/validate');
const iaRateLimiter = require('../../middlewares/iaRateLimiter');
const { registrarPresencaIaSchema } = require('../../validators/ia.validator');

const router = Router();

// ==========================================
// 1. ROTAS PÚBLICAS (Health Check)
// Fica ANTES do bloqueio de API Key para testes e monitores baterem livremente
// ==========================================
router.get('/health', iaController.checkPythonStatus);

// ==========================================
// 2. PROTEÇÃO DE ROTAS (Requer IA_API_KEY)
// A partir desta linha para baixo, o Express barra quem não tiver a chave
// ==========================================
router.use(validateApiKey);

// 3. A Rota Principal Unificada e Blindada
router.post(
  '/registrar-presenca', 
  iaRateLimiter, 
  validate(registrarPresencaIaSchema), 
  iaController.processarReconhecimento
);

// 4. Validação de rosto para alunos novos
router.post('/validar-aluno', iaController.validarAluno);

module.exports = router;