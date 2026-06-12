const disciplinaRepository = require('./disciplina.repository');
const AppError = require('../../utils/AppError');

class DisciplinaService {
  async createDisciplina(data) {
    const disciplinaExistente = await disciplinaRepository.findByCodigo(data.codigo);
    if (disciplinaExistente) {
      throw new AppError('Já existe uma disciplina cadastrada com este código.', 400);
    }

    return await disciplinaRepository.create(data);
  }

  async listarDisciplinas() {
    return await disciplinaRepository.findAll();
  }

  async buscarDisciplinaPorId(id) {
    const disciplina = await disciplinaRepository.findById(id);
    if (!disciplina) {
      throw new AppError('Disciplina não encontrada.', 404);
    }
    return disciplina;
  }

  async atualizarDisciplina(id, data) {
    await this.buscarDisciplinaPorId(id);

    if (data.codigo) {
      const disciplinaExistente = await disciplinaRepository.findByCodigo(data.codigo);
      if (disciplinaExistente && disciplinaExistente.id !== id) {
        throw new AppError('Este código já está em uso por outra disciplina.', 400);
      }
    }

    return await disciplinaRepository.update(id, data);
  }

  async deletarDisciplina(id) {
    await this.buscarDisciplinaPorId(id);
    return await disciplinaRepository.delete(id);
  }
}

module.exports = new DisciplinaService();