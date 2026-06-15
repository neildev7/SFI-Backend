const { Router } = require('express');
const relatorioController = require('./relatorio.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

// Apenas usuários logados e com nível administrativo podem tirar relatórios gerenciais
router.use(authenticate);
router.use(authorize([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.COZINHA]));

// Endpoints exatamente como o Claude pediu
router.get('/cozinha', relatorioController.getCozinha);
router.get('/secretaria/ausentes', relatorioController.getAusentes);
router.get('/secretaria/baixa-frequencia', relatorioController.getBaixaFrequencia);

module.exports = router;