const { Router } = require('express');
const presencaController = require('./presenca.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { registrarPresencaSchema } = require('../../validators/presenca.validator');
const ROLES = require('../../constants/roles');

const router = Router();

router.use(authenticate);

router.get('/', presencaController.getAll);
router.get('/hoje', presencaController.getHoje);
router.get('/aluno/:id', presencaController.getByAluno);
router.get('/turma/:id', presencaController.getByTurma);

// Validador de presença manual injetado
router.post(
  '/', 
  authorize([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.PROFESSOR]), 
  validate(registrarPresencaSchema), 
  presencaController.create
);

module.exports = router;