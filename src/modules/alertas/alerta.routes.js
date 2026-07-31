const { Router } = require('express');
const alertaController = require('./alerta.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const ROLES = require('../../constants/roles');

const router = Router();
router.use(authenticate); // Tranca tudo

// Secretaria e Admin podem ver e resolver alertas
router.get('/', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), alertaController.listar);
router.patch('/:id/resolver', authorize([ROLES.ADMIN, ROLES.SECRETARIA]), alertaController.resolver);

module.exports = router;