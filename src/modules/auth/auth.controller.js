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
}

module.exports = new AuthController();