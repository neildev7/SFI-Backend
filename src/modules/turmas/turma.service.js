const turmaRepository = require('./turma.repository');
const auditService = require('../auditoria/audit.service'); // <-- Importamos o gravador
const AppError = require('../../utils/AppError');

class TurmaService {
  // Adicionamos o usuarioLogadoId para saber quem fez a ação (vem lá do Controller / Token JWT)
  async createTurma(data, usuarioLogadoId) {
    const novaTurma = await turmaRepository.create(data);

    // Grava na caixa-preta
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'CREATE',
      entidade: 'Turma',
      entidadeId: novaTurma.id,
      dadosNovos: novaTurma
    });

    return novaTurma;
  }

  async listarTurmas() {
    return await turmaRepository.findAll();
  }

  async buscarTurmaPorId(id) {
    const turma = await turmaRepository.findById(id);
    if (!turma) {
      throw new AppError('Turma não encontrada.', 404);
    }
    return turma;
  }

  async listarAlunosDaTurma(id) {
    await this.buscarTurmaPorId(id);
    return await turmaRepository.findAlunosByTurmaId(id);
  }

  async atualizarTurma(id, data, usuarioLogadoId) {
    // Busca como era ANTES de alterar
    const turmaAntiga = await this.buscarTurmaPorId(id);
    
    // Atualiza no banco
    const turmaAtualizada = await turmaRepository.update(id, data);

    // Grava o rastro na caixa-preta
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'UPDATE',
      entidade: 'Turma',
      entidadeId: id,
      dadosAntigos: turmaAntiga,
      dadosNovos: turmaAtualizada
    });

    return turmaAtualizada;
  }

  async deletarTurma(id, usuarioLogadoId) {
    // Busca para registrar o que está sendo apagado
    const turmaAntiga = await this.buscarTurmaPorId(id);
    const turmaDeletada = await turmaRepository.delete(id);

    // Grava o soft-delete na caixa-preta
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'DELETE',
      entidade: 'Turma',
      entidadeId: id,
      dadosAntigos: turmaAntiga
    });

    return turmaDeletada;
  }
}

module.exports = new TurmaService();