const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const authConfig = require('../config/auth.config');
const AppError = require('../utils/AppError');

// Inicializa a Blacklist global se ainda não existir
if (!global.tokenBlacklist) {
  global.tokenBlacklist = new Set();
}

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o cabeçalho de autorização existe
    if (!authHeader) {
      throw new AppError('Token não fornecido. Faça login para acessar.', 401);
    }

    // 2. Valida o formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new AppError('Token mal formatado.', 401);
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError('Formato do token inválido.', 401);
    }

    // 3. Verificação da Blacklist (Direito ao esquecimento/Logout efetivo)
    if (global.tokenBlacklist.has(token)) {
      throw new AppError('Sessão encerrada. Faça login novamente.', 401);
    }

    // 4. Valida o token usando promisify para usar async/await
    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);

      // 5. Salva os dados do usuário na requisição
      req.usuario = {
        id: decoded.id,
        role: decoded.role
      };

      return next(); // Tudo certo!
      
    } catch (err) {
      throw new AppError('Token inválido ou expirado.', 401);
    }
  } catch (error) {
    next(error);
  }
};