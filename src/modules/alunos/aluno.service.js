const alunoRepository = require('./aluno.repository');
const AppError = require('../../utils/AppError');

class AlunoService {
  async createAluno(data) {
    // Regra: Não podem existir dois alunos com a mesma matrícula
    const alunoExistente = await alunoRepository.findByMatricula(data.matricula);
    if (alunoExistente) {
      throw new AppError('Já existe um aluno cadastrado com esta matrícula.', 400);
    }

    return await alunoRepository.create(data);
  }

  async listarAlunos() {
    return await alunoRepository.findAll();
  }

  async buscarAlunoPorId(id) {
    const aluno = await alunoRepository.findById(id);
    if (!aluno) {
      throw new AppError('Aluno não encontrado.', 404);
    }
    return aluno;
  }

  async atualizarAluno(id, data) {
    // Verifica se o aluno existe antes de atualizar
    await this.buscarAlunoPorId(id);

    // Se estiver tentando mudar a matrícula, verifica se a nova já existe
    if (data.matricula) {
      const alunoExistente = await alunoRepository.findByMatricula(data.matricula);
      if (alunoExistente && alunoExistente.id !== id) {
        throw new AppError('Esta matrícula já está em uso por outro aluno.', 400);
      }
    }

    return await alunoRepository.update(id, data);
  }

  async deletarAluno(id) {
    await this.buscarAlunoPorId(id);
    return await alunoRepository.delete(id);
  }
}

module.exports = new AlunoService();