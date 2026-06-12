const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Se estivermos em ambiente de desenvolvimento, enviamos a stack completa para debugar
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Em produção, enviamos apenas mensagens de erros operacionais (conhecidos)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Se for um erro desconhecido em produção (ex: erro no banco), não vazamos detalhes
  console.error('ERRO INESPERADO 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Algo deu errado no servidor.'
  });
};

module.exports = errorHandler;