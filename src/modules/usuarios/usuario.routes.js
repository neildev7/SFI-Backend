const { Router } = require('express');
const usuarioController = require('./usuario.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createUsuarioSchema } = require('../../validators/usuario.validator');
const ROLES = require('../../constants/roles');

const router = Router();

// Todas as rotas de usuários exigem que quem está acessando esteja logado E seja um ADMIN
router.use(authenticate);
router.use(authorize([ROLES.ADMIN]));

router.post('/', validate(createUsuarioSchema), usuarioController.create);
router.get('/', usuarioController.getAll);

module.exports = router;