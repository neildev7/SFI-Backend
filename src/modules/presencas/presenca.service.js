const presencaRepository = require('./presenca.repository');
const alunoService = require('../alunos/aluno.service');
const turmaService = require('../turmas/turma.service');
const AppError = require('../../utils/AppError');

class PresencaService {
  async registrarPresencaManual(data) {
    // Valida se o aluno e a turma existem antes de registrar a presença
    await alunoService.buscarAlunoPorId(data.alunoId);
    await turmaService.buscarTurmaPorId(data.turmaId);

    // Se a presença manual não tiver data, o Prisma assume o "agora" (default: now())
    return await presencaRepository.create(data);
  }

  async listarTodas() {
    return await presencaRepository.findAll();
  }

  async listarPorAluno(alunoId) {
    // Garante que o aluno existe antes de buscar as presenças
    await alunoService.buscarAlunoPorId(alunoId);
    return await presencaRepository.findByAlunoId(alunoId);
  }

  async listarPorTurma(turmaId) {
    await turmaService.buscarTurmaPorId(turmaId);
    return await presencaRepository.findByTurmaId(turmaId);
  }

  async listarPresencasHoje() {
    return await presencaRepository.findPresencasDeHoje();
  }
}

module.exports = new PresencaService();