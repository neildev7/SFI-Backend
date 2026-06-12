const { Router } = require('express');
const relatorioController = require('./relatorio.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

// Protege todas as rotas de relatórios
router.use(authenticate);

// Rota exclusiva para a equipe da cozinha e administradores
router.get('/cozinha', authorize([ROLES.ADMIN, ROLES.COZINHA]), relatorioController.getCozinha);

// Rotas exclusivas para gestão e secretaria
router.get('/secretaria', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), relatorioController.getSecretaria);
router.get('/diario', authorize([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.PROFESSOR]), relatorioController.getDiario);
router.get('/mensal', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), relatorioController.getMensal);

module.exports = router;