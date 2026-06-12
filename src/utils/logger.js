const winston = require('winston');

// Cria um sistema de logs que exibe no terminal e também salva em arquivos
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(), // Mostra no terminal
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Salva erros aqui
    new winston.transports.File({ filename: 'logs/system.log' }) // Salva avisos gerais dos Jobs aqui
  ]
});

module.exports = logger;