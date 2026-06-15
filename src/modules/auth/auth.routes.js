const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { loginSchema } = require('../../validators/auth.validator');

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

// Nova rota para o Miguel bater quando o Token de Acesso morrer
router.post('/refresh', authController.refresh);

module.exports = router;