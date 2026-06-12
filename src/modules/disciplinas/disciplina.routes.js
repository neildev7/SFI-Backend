const { Router } = require('express');
const disciplinaController = require('./disciplina.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();

router.use(authenticate);

// Listagem aberta
router.get('/', disciplinaController.getAll);
router.get('/:id', disciplinaController.getById);

// Modificações restritas
router.post('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), disciplinaController.create);
router.patch('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), disciplinaController.update);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), disciplinaController.delete);

module.exports = router;