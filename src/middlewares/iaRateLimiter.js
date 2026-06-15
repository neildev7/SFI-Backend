const rateLimit = require('express-rate-limit');

// Limite rigoroso: No máximo 10 requisições de reconhecimento por minuto por IP
const iaRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, 
  message: { 
    status: 'error', 
    message: 'Muitas tentativas de reconhecimento facial. Aguarde um minuto.' 
  }
});

module.exports = iaRateLimiter;