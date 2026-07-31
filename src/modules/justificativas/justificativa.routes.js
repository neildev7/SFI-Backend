const { Router } = require('express');
const justificativaController = require('./justificativa.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

// ==========================================
// PROTEÇÃO GLOBAL
// Todas as rotas de justificativas exigem que o usuário esteja logado
// ==========================================
router.use(authenticate);

// ==========================================
// 1. ROTAS DE LEITURA (O encanamento novo)
// ==========================================
// Rota para o painel do Victor listar o que precisa ser aprovado
router.get(
  '/', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA]), 
  justificativaController.listar
);

// ==========================================
// 2. ROTAS DE AÇÃO (A rota que você já tinha)
// ==========================================
// Rota para justificar uma falta (anexar atestado, etc.)
router.post(
  '/:presencaId/justificar', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.PROFESSOR]), 
  justificativaController.create // <-- Se no seu controller o nome da função for 'create', é só trocar aqui!
);

module.exports = router;