const axios = require('axios');
const alunoService = require('../alunos/aluno.service');
const horarioService = require('../horarios/horario.service');
const presencaRepository = require('../presencas/presenca.repository');
const AppError = require('../../utils/AppError');
const prisma = require('../../database/client');

const THRESHOLD_CONFIANCA_IA = Number(process.env.IA_MIN_CONFIDENCE_SCORE) || 0.85;

// Configuração do Circuit Breaker Manual
let circuitAberto = false;
let falhasSeguidas = 0;
let tempoRecuperacaoCircuit = null;

const pythonClient = axios.create({
  baseURL: process.env.PYTHON_API_URL || 'http://localhost:5000',
  timeout: 5000, 
  headers: { 'Authorization': `Bearer ${process.env.IA_API_KEY}` }
});

class IaService {
  async processarReconhecimento(data) {
    const { alunoId, turmaId, faceScore, imagemHash } = data;

    const aluno = await alunoService.buscarAlunoPorId(alunoId);
    const scoreFormatado = faceScore ? (faceScore * 100).toFixed(1) : '0.0';

    // 1. Validação de Limiar de Confiança (mantido igual)
    if (faceScore !== undefined && faceScore !== null && faceScore < THRESHOLD_CONFIANCA_IA) {
      await prisma.iaLog.create({
        data: {
          alunoId: aluno.id,
          turmaId: turmaId || null,
          faceScore: faceScore,
          imagemHash: imagemHash || null,
          resultado: 'REJEITADO',
          motivo: `Baixa confiança (${scoreFormatado}%). Mínimo exigido é ${THRESHOLD_CONFIANCA_IA * 100}%.`
        }
      });
      throw new AppError(`Reconhecimento rejeitado. Baixa confiança (${scoreFormatado}%).`, 422);
    }

    // 2. Já existe presença HOJE pra esse aluno nessa turma? (dia inteiro, sem disciplina)
    const presencaHoje = await presencaRepository.buscarPresencaCompletaDeHoje(alunoId, turmaId);

    // 3. Já tem entrada hoje -> este scan é SAÍDA
    if (presencaHoje) {
      if (!presencaHoje.dataHoraSaida) {
        const statusSaida = await horarioService.validarStatusSaidaDia(turmaId);

        const [saidaRegistrada] = await prisma.$transaction([
          prisma.presenca.update({
            where: { id: presencaHoje.id },
            data: {
              dataHoraSaida: new Date(),
              status: statusSaida || presencaHoje.status
            }
          }),
          prisma.iaLog.create({
            data: {
              alunoId: aluno.id,
              turmaId,
              faceScore,
              imagemHash: imagemHash || null,
              resultado: 'ACEITO',
              motivo: statusSaida === 'SAIDA_ANTECIPADA' ? 'Saída antecipada registrada.' : 'Saída registrada.'
            }
          })
        ]);

        return {
          aluno: aluno.nome,
          status: statusSaida === 'SAIDA_ANTECIPADA' ? 'SAIDA_ANTECIPADA_REGISTRADA' : 'SAIDA_REGISTRADA',
          presenca: saidaRegistrada
        };
      }

      // 4. Já tem entrada E já tem saída -> ciclo do dia já foi concluído
      return {
        aluno: aluno.nome,
        status: 'IGNORADO',
        mensagem: `${aluno.nome} já concluiu o ciclo de presença hoje.`
      };
    }

    // 5. Primeiro scan do dia -> ENTRADA (presente em todas as aulas)
    const [novaPresenca] = await prisma.$transaction([
      prisma.presenca.create({
        data: {
          alunoId: aluno.id,
          turmaId: turmaId,
          status: 'PRESENTE',
          origem: 'FACIAL',
          faceScore: faceScore || null,
          dataHora: new Date()
        }
      }),
      prisma.iaLog.create({
        data: {
          alunoId: aluno.id,
          turmaId,
          faceScore,
          imagemHash: imagemHash || null,
          resultado: 'ACEITO',
          motivo: 'Entrada registrada (presença do dia inteiro).'
        }
      })
    ]);

    return {
      aluno: aluno.nome,
      status: 'ENTRADA_REGISTRADA',
      presenca: novaPresenca
    };
  }

  // 5. Envio de foto pro Python com Retry, Backoff e CIRCUIT BREAKER!
  async validarFaceAluno(arquivoImagem) {
    if (circuitAberto) {
      if (Date.now() > tempoRecuperacaoCircuit) {
        circuitAberto = false;
        falhasSeguidas = 0;
      } else {
        throw new AppError('O serviço de IA está temporariamente fora do ar (Circuit Breaker Ativo). Tente novamente em instantes.', 503);
      }
    }

    let tentativas = 0;
    const maxTentativas = 3;

    while (tentativas < maxTentativas) {
      try {
        const response = await pythonClient.post('/reconhecer', { imagem: arquivoImagem });
        falhasSeguidas = 0;
        return response.data;
      } catch (error) {
        tentativas++;
        console.error(`🚨 Erro de comunicação com a IA Python (Tentativa ${tentativas}/${maxTentativas})`);

        if (tentativas >= maxTentativas) {
          falhasSeguidas++;
          if (falhasSeguidas >= 5) {
            circuitAberto = true;
            tempoRecuperacaoCircuit = Date.now() + 30000;
            console.error('🚨 [CIRCUIT BREAKER] Circuito aberto! Protegendo o servidor Node de sobrecarga.');
          }
          throw new AppError('Falha crítica de comunicação com o microsserviço de IA.', 503);
        }
        await new Promise(resolve => setTimeout(resolve, tentativas * 1000));
      }
    }
  }
}

module.exports = new IaService();