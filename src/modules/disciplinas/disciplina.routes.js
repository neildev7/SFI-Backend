const { Router } = require('express');
const disciplinaController = require('./disciplina.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createDisciplinaSchema, updateDisciplinaSchema } = require('../../validators/disciplina.validator');
const ROLES = require('../../constants/roles');

const router = Router();

router.use(authenticate);

router.get('/', disciplinaController.getAll);
router.get('/:id', disciplinaController.getById);

// Validadores do Zod injetados
router.post('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(createDisciplinaSchema), disciplinaController.create);
router.patch('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), validate(updateDisciplinaSchema), disciplinaController.update);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), disciplinaController.delete);

module.exports = router;