const { Router } = require('express');
const iaController = require('./ia.controller');
const validateApiKey = require('../../middlewares/validateApiKey');
const validate = require('../../middlewares/validate');
const iaRateLimiter = require('../../middlewares/iaRateLimiter');
const { registrarPresencaIaSchema } = require('../../validators/ia.validator');

const router = Router();

// Middleware de API Key (Proteção Sever-to-Server)
router.use(validateApiKey);

// Rota interceptada pelo Zod para sanitizar os dados do Python
router.post('/registrar-presenca', validate(registrarPresencaIaSchema), iaController.registrarPresenca);
router.post('/validar-aluno', iaController.validarAluno);
router.get('/health', iaController.checkPythonStatus);
router.post('/reconhecer', iaRateLimiter, iaController.processarReconhecimento);
module.exports = router;