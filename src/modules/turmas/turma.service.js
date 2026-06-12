const turmaRepository = require('./turma.repository');
const AppError = require('../../utils/AppError');

class TurmaService {
  async createTurma(data) {
    return await turmaRepository.create(data);
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
    const turma = await turmaRepository.findTurmaComAlunos(id);
    if (!turma) {
      throw new AppError('Turma não encontrada.', 404);
    }
    
    // Formata o retorno para enviar uma lista limpa de alunos para o frontend
    const alunos = turma.alunos.map(vinculo => vinculo.aluno);
    return alunos;
  }

  async atualizarTurma(id, data) {
    await this.buscarTurmaPorId(id);
    return await turmaRepository.update(id, data);
  }

  async deletarTurma(id) {
    await this.buscarTurmaPorId(id);
    return await turmaRepository.delete(id);
  }
}

module.exports = new TurmaService();