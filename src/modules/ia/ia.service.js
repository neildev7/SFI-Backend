const alunoService = require('../alunos/aluno.service');
const presencaService = require('../presencas/presenca.service');
const presencaRepository = require('../presencas/presenca.repository');
const horarioService = require('../horarios/horario.service');
const AppError = require('../../utils/AppError');

const THRESHOLD_CONFIANCA_IA = 0.85;

class IaService {
  async processarReconhecimento(data) {
    const { alunoId, turmaId, faceScore } = data;

    // 1. Confirmações iniciais
    const aluno = await alunoService.buscarAlunoPorId(alunoId);
    if (faceScore !== undefined && faceScore !== null && faceScore < THRESHOLD_CONFIANCA_IA) {
      throw new AppError(`Reconhecimento rejeitado. Baixa confiança (${(faceScore * 100).toFixed(1)}%).`, 422);
    }
    const disciplinaIdDetectada = await horarioService.validarEObterDisciplinaAtual(turmaId);

    // 2. A NOVA REGRA DE ENTRADA E SAÍDA
    const presencaHoje = await presencaRepository.buscarPresencaCompletaDeHoje(alunoId, turmaId);

    // Se o aluno JÁ BATEU O PONTO DE ENTRADA hoje
    if (presencaHoje) {
      // Verifica se ele AINDA NÃO BATEU A SAÍDA
      if (!presencaHoje.dataHoraSaida) {
        // Registra a saída do garoto!
        const saidaRegistrada = await presencaRepository.registrarSaida(presencaHoje.id);
        return {
          aluno: aluno.nome,
          status: 'SAIDA_REGISTRADA',
          presenca: saidaRegistrada
        };
      } else {
        // Se já tem entrada e saída, apenas ignora para não floodar o banco
        return {
          aluno: aluno.nome,
          status: 'IGNORADO',
          mensagem: 'O ciclo de entrada e saída deste aluno já foi concluído hoje.'
        };
      }
    }

    // 3. Se não caiu em nenhum 'if' acima, é porque é a PRIMEIRA VEZ no dia. Registra a ENTRADA.
    const novaPresenca = await presencaService.registrarPresencaManual({
      alunoId,
      turmaId,
      disciplinaId: disciplinaIdDetectada,
      status: 'PRESENTE',
      origem: 'FACIAL',
      faceScore: faceScore || null
    });

    return {
      aluno: aluno.nome,
      status: 'ENTRADA_REGISTRADA',
      presenca: novaPresenca
    };
  }

  async validarFaceAluno(arquivoImagem) {
    return { mensagem: 'Função de treinamento a ser implementada na integração final.' };
  }
}

module.exports = new IaService();