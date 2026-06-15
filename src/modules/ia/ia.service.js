const alunoService = require('../alunos/aluno.service');
const presencaService = require('../presencas/presenca.service');
const presencaRepository = require('../presencas/presenca.repository'); 
const AppError = require('../../utils/AppError');

// Constante sênior: Linha de corte de 85% de assertividade da face
const THRESHOLD_CONFIANCA_IA = 0.85;

class IaService {
  async processarReconhecimento(data) {
    const { alunoId, turmaId, disciplinaId, faceScore } = data;

    // 1. Confirma se o aluno realmente existe e está ativo
    const aluno = await alunoService.buscarAlunoPorId(alunoId);

    // 2. NOVA VALIDAÇÃO: Se o Pietro mandar o score, checa se passou na linha de corte
    if (faceScore !== undefined && faceScore !== null) {
      if (faceScore < THRESHOLD_CONFIANCA_IA) {
        // Lança um erro 422 (Entidade Não Processável) para o script Python saber que foi rejeitado por baixa confiança
        throw new AppError(
          `Reconhecimento rejeitado. Confiança de ${(faceScore * 100).toFixed(1)}% está abaixo do mínimo exigido (${THRESHOLD_CONFIANCA_IA * 100}%).`, 
          422
        );
      }
    }

    // 3. REGRA DE DEDUPLICAÇÃO: O aluno já bateu o ponto hoje?
    const jaRegistrado = await presencaRepository.verificarPresencaExistenteHoje(alunoId, turmaId);

    if (jaRegistrado) {
      return {
        aluno: aluno.nome,
        status: 'IGNORADO',
        mensagem: 'O aluno já possui presença registrada para esta turma no dia de hoje.'
      };
    }

    // 4. Se passou em tudo, registra a presença forçando a origem FACIAL
    const novaPresenca = await presencaService.registrarPresencaManual({
      alunoId,
      turmaId,
      disciplinaId,
      status: 'PRESENTE',
      origem: 'FACIAL',
      faceScore: faceScore || null
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