const axios = require('axios');
const alunoService = require('../alunos/aluno.service');
const presencaService = require('../presencas/presenca.service');
const presencaRepository = require('../presencas/presenca.repository');
const horarioService = require('../horarios/horario.service');
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
    const { alunoId, turmaId, faceScore, imagemHash } = data; // Recebe o imagemHash opcional da requisição

    const aluno = await alunoService.buscarAlunoPorId(alunoId);
    const scoreFormatado = faceScore ? (faceScore * 100).toFixed(1) : '0.0';
    
    // 1. Validação de Limiar de Confiança (Se falhar, gera log de REJEITADO)
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

    // 2. Descobre a aula atual conforme a grade horária
    const { disciplinaId, statusCalculado } = await horarioService.validarEObterDisciplinaAtual(turmaId);

    // 3. Regra de Deduplicação e Registro de Saída
    const presencaHoje = await presencaRepository.buscarPresencaDeHojePorDisciplina(alunoId, turmaId, disciplinaId);

    if (presencaHoje) {
      if (!presencaHoje.dataHoraSaida) {
        const statusSaida = await horarioService.validarStatusSaida(turmaId, disciplinaId);
        const saidaRegistrada = await presencaRepository.registrarSaida(presencaHoje.id, statusSaida);
        
        // Log de sucesso na saída
        await prisma.iaLog.create({
          data: {
            alunoId: aluno.id,
            turmaId,
            faceScore,
            imagemHash: imagemHash || null,
            resultado: 'ACEITO',
            motivo: statusSaida === 'SAIDA_ANTECIPADA' ? 'Saída antecipada registrada.' : 'Saída normal registrada.'
          }
        });

        return {
          aluno: aluno.nome,
          status: statusSaida === 'SAIDA_ANTECIPADA' ? 'SAIDA_ANTECIPADA_REGISTRADA' : 'SAIDA_REGISTRADA',
          presenca: saidaRegistrada
        };
      } else {
        return {
          aluno: aluno.nome,
          status: 'IGNORADO',
          mensagem: 'O ciclo desta disciplina já foi concluído hoje.'
        };
      }
    }

    // 4. Registra a Entrada com Sucesso
    const novaPresenca = await presencaService.registrarPresencaManual({
      alunoId,
      turmaId,
      disciplinaId,
      status: statusCalculado,
      origem: 'FACIAL',
      faceScore: faceScore || null
    });

    // Log de sucesso na entrada (Auditoria LGPD completa!)
    await prisma.iaLog.create({
      data: {
        alunoId: aluno.id,
        turmaId,
        faceScore,
        imagemHash: imagemHash || null,
        resultado: 'ACEITO',
        motivo: `Entrada registrada com status: ${statusCalculado}.`
      }
    });

    return {
      aluno: aluno.nome,
      status: 'ENTRADA_REGISTRADA',
      presenca: novaPresenca
    };
  }

  // 5. Envio de foto pro Python com Retry, Backoff e CIRCUIT BREAKER!
  async validarFaceAluno(arquivoImagem) {
    // Verifica se o Circuit Breaker está aberto (bloqueando requisições)
    if (circuitAberto) {
      if (Date.now() > tempoRecuperacaoCircuit) {
        // Tempo de tolerância passou, tenta fechar o circuito para testar a rede novamente
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
        
        // Se deu certo, reseta o contador de falhas do Circuit Breaker
        falhasSeguidas = 0;
        return response.data;
      } catch (error) {
        tentativas++;
        console.error(`🚨 Erro de comunicação com a IA Python (Tentativa ${tentativas}/${maxTentativas})`);

        if (tentativas >= maxTentativas) {
          falhasSeguidas++;
          
          // Se o Python falhar consecutivamente 5 vezes seguidas na fila, abre o circuito!
          if (falhasSeguidas >= 5) {
            circuitAberto = true;
            tempoRecuperacaoCircuit = Date.now() + 30000; // Bloqueia chamadas por 30 segundos
            console.error('🚨 [CIRCUIT BREAKER] Circuito aberto! Protegendo o servidor Node de sobrecarga.');
          }

          throw new AppError('Falha crítica de comunicação com o microsserviço de IA.', 503);
        }

        // Retry com Backoff exponencial simples
        await new Promise(resolve => setTimeout(resolve, tentativas * 1000));
      }
    }
  }
}

module.exports = new IaService();