const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const authConfig = require('../../config/auth.config');
const AppError = require('../../utils/AppError');

class AuthService {
  async login(email, senha) {
    // 1. Verifica se o usuário existe
    const usuario = await authRepository.findUserByEmail(email);
    
    if (!usuario) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    // 2. Compara a senha digitada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      throw new AppError('E-mail ou senha incorretos', 401);
    }

    // 3. Gera o Token JWT
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      authConfig.secret,
      { expiresIn: authConfig.expiresIn }
    );

    // 4. Retorna os dados do usuário (sem a senha) e o token
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return {
      usuario: usuarioSemSenha,
      token
    };
  }
}

module.exports = new AuthService();