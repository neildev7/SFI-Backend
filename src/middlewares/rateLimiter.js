const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
  max: 100, // Limite de 100 requisições por IP a cada 15 minutos
  handler: (req, res, next) => {
    // Se passar de 100, o usuário recebe esse erro 429 (Too Many Requests)
    next(new AppError('Muitas requisições vindas deste IP. Por favor, tente novamente em 15 minutos.', 429));
  },
  standardHeaders: true, // Retorna os cabeçalhos de rate limit no response
  legacyHeaders: false, // Desabilita os cabeçalhos X-RateLimit-* antigos
});

module.exports = rateLimiter;