const { Router } = require('express');
const horarioController = require('./horario.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

// ==========================================
// TODAS as rotas precisam de login
// ==========================================
router.use(authenticate);

// ==========================================
// 1. LEITURA (Liberado para Autenticados)
// ==========================================
// Busca todos os horários cadastrados
router.get('/', horarioController.getAll); 

// Busca qual aula está acontecendo AGORA para uma turma (Usado no Flutter)
router.get('/turma/:id/agora', horarioController.buscarAulaAtual); 

// ==========================================
// 2. ESCRITA E EDIÇÃO (Trancado! Só a Chefia)
// A trava 'authorize' impede acessos indevidos!
// ==========================================
router.post(
  '/', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA]), 
  horarioController.create
);

router.patch(
  '/:id', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA]), 
  horarioController.update
);

router.delete(
  '/:id', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA]), 
  horarioController.delete
);

module.exports = router;