const usuarioRepository = require('./usuario.repository');
const auditService = require('../auditoria/audit.service');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcryptjs'); // Se não tiver instalado, rode: npm install bcrypt

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

  // Adicione isso na classe UsuarioService
  async atualizarUsuario(id, data, usuarioLogadoId) {
    const usuarioRepository = require('./usuario.repository');
    const auditService = require('../auditoria/audit.service');
    const AppError = require('../../utils/AppError');

    // 1. Garante que o usuário que queremos editar existe
    const usuarioAntigo = await usuarioRepository.findById(id);
    if (!usuarioAntigo) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    // 2. Se tentarem mudar o e-mail, verifica se já não tem outro igual
    if (data.email && data.email !== usuarioAntigo.email) {
      const emailEmUso = await usuarioRepository.findByEmail(data.email);
      if (emailEmUso) {
        throw new AppError('Este e-mail já está em uso por outro usuário.', 400);
      }
    }

    // 3. Atualiza no banco
    const usuarioAtualizado = await usuarioRepository.update(id, data);

    // 4. Registra na Auditoria (LGPD) - Quem demitiu/editou quem?
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'UPDATE',
      entidade: 'Usuario',
      entidadeId: id,
      dadosAntigos: { nome: usuarioAntigo.nome, ativo: usuarioAntigo.ativo, cargo: usuarioAntigo.cargo },
      dadosNovos: { nome: usuarioAtualizado.nome, ativo: usuarioAtualizado.ativo, cargo: usuarioAtualizado.cargo }
    });

    return usuarioAtualizado;
  }

}

module.exports = new UsuarioService();