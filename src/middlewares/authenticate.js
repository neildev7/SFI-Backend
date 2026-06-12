const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const authConfig = require('../config/auth.config');
const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o token foi enviado no cabeçalho
    if (!authHeader) {
      throw new AppError('Token não fornecido. Faça login para acessar.', 401);
    }

    // O padrão é "Bearer <token>", então separamos pelo espaço
    const [, token] = authHeader.split(' ');

    try {
      // 2. Tenta decodificar e validar o token com a nossa chave secreta
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);

      // 3. Salva o ID e a Role do usuário dentro da requisição
      req.usuario = {
        id: decoded.id,
        role: decoded.role
      };

      return next(); // Tudo certo, pode seguir para a rota!
      
    } catch (err) {
      throw new AppError('Token inválido ou expirado.', 401);
    }
  } catch (error) {
    next(error);
  }
};