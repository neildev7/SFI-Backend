const presencaRepository = require('./presenca.repository');
const alunoService = require('../alunos/aluno.service');
const turmaService = require('../turmas/turma.service');
const AppError = require('../../utils/AppError');

class PresencaService {
  async registrarPresencaManual(data) {
    const { alunoId, turmaId, disciplinaId, status, origem, faceScore } = data;

    // 1. Valida se o aluno e a turma existem e estão ativos antes de registrar a presença
    await alunoService.buscarAlunoPorId(alunoId);
    await turmaService.buscarTurmaPorId(turmaId);

    // 2. O ESCUDO ANTI-DUPLICATA: Verifica se o aluno já tem presença hoje para essa turma
    const jaRegistrado = await presencaRepository.verificarPresencaExistenteHoje(alunoId, turmaId);

    if (jaRegistrado) {
      // Devolve ERRO 409 (Conflict) para o Miguel exibir o pop-up vermelho no app
      throw new AppError('Este aluno já possui uma presença registrada para esta turma no dia de hoje.', 409);
    }

    // 3. Se passou no escudo, cria o registro no banco
    // Se a presença manual não tiver data, o Prisma assume o "agora" (default: now())
    return await presencaRepository.create({
      alunoId,
      turmaId,
      disciplinaId,
      status: status || 'PRESENTE',
      origem: origem || 'MANUAL', 
      faceScore: faceScore || null
    });
  }

  // Repassa a página e o limite
  async listarTodas(pagina, limite) {
    return await presencaRepository.findAll(pagina, limite);
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