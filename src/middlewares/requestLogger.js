const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Registra o método (GET, POST), a URL que foi acessada e o IP do usuário
  logger.info(`[${req.method}] ${req.originalUrl} - IP: ${req.ip}`);
  
  next(); // Passa a bola pra frente!
};

module.exports = requestLogger;