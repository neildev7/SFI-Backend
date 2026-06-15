const usuarioRepository = require('./usuario.repository');
const auditService = require('../auditoria/audit.service');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcrypt'); // Se não tiver instalado, rode: npm install bcrypt

class UsuarioService {
  async criarUsuario(data, usuarioLogadoId) {
    // 1. Checa se o e-mail já está em uso
    const emailExiste = await usuarioRepository.findByEmail(data.email);
    if (emailExiste) {
      throw new AppError('Este e-mail já está cadastrado no sistema.', 400);
    }

    // 2. Criptografa a senha antes de salvar no banco
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(data.senha, salt);

    // 3. Salva no banco
    const novoUsuario = await usuarioRepository.create({
      ...data,
      senha: senhaHash
    });

    // 4. Grava no AuditLog
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'CREATE',
      entidade: 'Usuario',
      entidadeId: novoUsuario.id,
      dadosNovos: novoUsuario
    });

    return novoUsuario;
  }

  async listarUsuarios() {
    return await usuarioRepository.findAll();
  }

}

module.exports = new UsuarioService();