const usuarioService = require('./usuario.service');

class UsuarioController {
  async create(req, res, next) {
    try {
      // req.usuario.id vem do seu middleware de autenticação (JWT)
      const novoUsuario = await usuarioService.criarUsuario(req.body, req.usuario.id);
      return res.status(201).json({ status: 'success', data: novoUsuario });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const usuarios = await usuarioService.listarUsuarios();
      return res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();