const { Router } = require('express');
const turmaController = require('./turma.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createTurmaSchema, updateTurmaSchema } = require('../../validators/turma.validator');
const ROLES = require('../../constants/roles');

const router = Router();

router.use(authenticate);

router.get('/', turmaController.getAll);
router.get('/:id', turmaController.getById);
router.get('/:id/alunos', turmaController.getAlunosDaTurma);
router.get('/:id/frequencia/consolidado', turmaController.getConsolidadoFrequencia);

// Validadores do Zod injetados nas rotas de modificação
router.post('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(createTurmaSchema), turmaController.create);
router.patch('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(updateTurmaSchema), turmaController.update);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), turmaController.delete);

module.exports = router;