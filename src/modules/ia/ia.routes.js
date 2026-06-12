const { Router } = require('express');
const iaController = require('./ia.controller');
const validateApiKey = require('../../middlewares/validateApiKey');

const router = Router();

// ATENÇÃO: Aqui NÃO usamos o authenticate (JWT). 
// Usamos a nossa Api Key para o Python conseguir bater nessa rota diretamente.
router.use(validateApiKey);

// Python detectou um rosto e chama esta rota
router.post('/registrar-presenca', iaController.registrarPresenca);

// Rota auxiliar para validações de imagem
router.post('/validar-aluno', iaController.validarAluno);

module.exports = router;