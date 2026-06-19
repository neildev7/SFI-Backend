const { Router } = require('express');
const iaController = require('./ia.controller');
const validateApiKey = require('../../middlewares/validateApiKey');
const validate = require('../../middlewares/validate');
const iaRateLimiter = require('../../middlewares/iaRateLimiter');
const { registrarPresencaIaSchema } = require('../../validators/ia.validator');

const router = Router();

// Middleware de API Key (Proteção Server-to-Server)
router.use(validateApiKey);

// 1. Health Check (A gente deixa antes para não cair em validações de body)
router.get('/health', iaController.checkPythonStatus);

// 2. A Rota Principal Unificada e Blindada
// Agora tem o Rate Limiter, o Validador do Zod e o nome correto do Controller!
router.post(
  '/registrar-presenca', 
  iaRateLimiter, 
  validate(registrarPresencaIaSchema), 
  iaController.processarReconhecimento
);

// 3. Validação de rosto para alunos novos
router.post('/validar-aluno', iaController.validarAluno);

module.exports = router;