const AppError = require('../utils/AppError');

const validateApiKey = (req, res, next) => {
  // O Python do Pietro terá que enviar essa chave no cabeçalho de toda requisição
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.IA_API_KEY) {
    return next(new AppError('Acesso negado. API Key ausente ou inválida.', 401));
  }

  next(); // Chave correta, pode entrar!
};

module.exports = validateApiKey;