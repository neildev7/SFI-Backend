const authService = require('./auth.service');

class AuthController {
  // Função que o Express vai chamar quando bater na rota
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      const result = await authService.login(email, senha);

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      // Passa o erro para o nosso errorHandler global
      next(error); 
    }
  }
  
  async refresh(req, res, next) {
    try {
      // O frontend deve mandar o refresh token no corpo da requisição
      const { refreshToken } = req.body;
      const tokens = await authService.renovarToken(refreshToken);
      
      return res.status(200).json({ status: 'success', data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (!global.tokenBlacklist) global.tokenBlacklist = new Set();
      
      // Adiciona o token na lista negra!
      global.tokenBlacklist.add(token);
    }
    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  }
}

module.exports = new AuthController();