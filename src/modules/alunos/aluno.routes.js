const { Router } = require('express');
const alunoController = require('./aluno.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createAlunoSchema, updateAlunoSchema } = require('../../validators/aluno.validator');
const ROLES = require('../../constants/roles');

const router = Router();

router.use(authenticate);

router.get('/', alunoController.getAll);
router.get('/:id', alunoController.getById);
router.get('/:id/frequencia', alunoController.getFrequencia);

// Aqui entram os validadores do Zod ANTES do controller
router.post('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(createAlunoSchema), alunoController.create);
router.patch('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(updateAlunoSchema), alunoController.update);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), alunoController.delete);

module.exports = router;