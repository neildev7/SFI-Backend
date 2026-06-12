const { Router } = require('express');
const turmaController = require('./turma.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

// Protege todas as rotas de turmas
router.use(authenticate);

// Consultas abertas para qualquer pessoa logada (Professores precisam ver as turmas)
router.get('/', turmaController.getAll);
router.get('/:id', turmaController.getById);
router.get('/:id/alunos', turmaController.getAlunos); // Endpoint específico que lista os alunos da turma

// Ações de modificação restritas
router.post('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), turmaController.create);
router.patch('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), turmaController.update);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), turmaController.delete);

module.exports = router;