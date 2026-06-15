const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const prisma = require('../../database/client');
const authConfig = require('../../config/auth.config');
const AppError = require('../../utils/AppError');

class AuthService {
  // Função auxiliar interna para não repetir código
  _gerarTokens(usuario) {
    const token = jwt.sign({ id: usuario.id, role: usuario.role }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
    });

    const refreshToken = jwt.sign({ id: usuario.id }, authConfig.refreshSecret, {
      expiresIn: authConfig.refreshExpiresIn
    });

    return { token, refreshToken };
  }

  async login(email, senha) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const { token, refreshToken } = this._gerarTokens(usuario);

    return {
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      token,
      refreshToken
    };
  }

  async renovarToken(tokenAntigo) {
    if (!tokenAntigo) {
      throw new AppError('Refresh Token não fornecido.', 401);
    }

    try {
      // Verifica se o refresh token é válido e ainda não expirou (7 dias)
      const decoded = await promisify(jwt.verify)(tokenAntigo, authConfig.refreshSecret);

      // Busca o usuário de novo para garantir que ele não foi deletado do banco nesse meio tempo
      const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });

      if (!usuario) {
        throw new AppError('Usuário não encontrado.', 401);
      }

      // Devolve um novo par de tokens zerado
      return this._gerarTokens(usuario);
    } catch (error) {
      throw new AppError('Refresh Token inválido ou expirado. Faça login novamente.', 401);
    }
  }
}

module.exports = new AuthService();