const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    // O Zod verifica se o req.body, req.query e req.params estão corretos
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next(); // Passou na validação, pode ir para o Controller!
  } catch (error) {
    // Se o Zod barrar, formatamos as mensagens de erro de forma amigável
    const mensagensErro = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    next(new AppError(`Erro de Validação: ${mensagensErro}`, 400));
  }
};

module.exports = validate;