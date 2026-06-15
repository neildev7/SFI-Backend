const { Router } = require('express');
const horarioController = require('./horario.controller');
const authenticate = require('../../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.post('/', horarioController.create);
router.get('/', horarioController.getAll);

module.exports = router;