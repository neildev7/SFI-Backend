const alunoService = require('../alunos/aluno.service');
const presencaService = require('../presencas/presenca.service');
const presencaRepository = require('../presencas/presenca.repository'); // Importamos o repositório
const AppError = require('../../utils/AppError');

class IaService {
  async processarReconhecimento(data) {
    const { alunoId, turmaId, disciplinaId } = data;

    // 1. Confirma se o aluno realmente existe e está ativo
    const aluno = await alunoService.buscarAlunoPorId(alunoId);

    // 2. REGRA DE DEDUPLICAÇÃO: O aluno já bateu o ponto hoje?
    const jaRegistrado = await presencaRepository.verificarPresencaExistenteHoje(alunoId, turmaId);

    if (jaRegistrado) {
      // Devolvemos sucesso para o Python ficar tranquilo, mas não salvamos nada no banco!
      return {
        aluno: aluno.nome,
        status: 'IGNORADO',
        mensagem: 'O aluno já possui presença registrada para esta turma no dia de hoje.'
      };
    }

    // 3. Se não bateu o ponto ainda, registra a presença normalmente
    const novaPresenca = await presencaService.registrarPresencaManual({
      alunoId,
      turmaId,
      disciplinaId,
      status: 'PRESENTE'
    });

    return {
      aluno: aluno.nome,
      status: 'REGISTRADO',
      presenca: novaPresenca
    };
  }

  async validarFaceAluno(arquivoImagem) {
    return { mensagem: 'Função de treinamento a ser implementada na integração final.' };
  }
}

module.exports = new IaService();