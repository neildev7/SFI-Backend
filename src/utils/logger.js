const winston = require('winston');
require('winston-daily-rotate-file'); // <--- A MÁGICA AQUI

// Configuração da rotação: Cria um arquivo por dia, zipa os antigos e apaga após 14 dias
const transportArquivo = new winston.transports.DailyRotateFile({
  filename: 'logs/senai-api-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m', // Se o arquivo passar de 20MB no dia, ele quebra em outro
  maxFiles: '14d' // Deleta o que for mais velho que 2 semanas!
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    transportArquivo,
    new winston.transports.Console() // Continua imprimindo no terminal pra você ver
  ]
});

module.exports = logger;