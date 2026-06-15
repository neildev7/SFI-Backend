const alunoRepository = require('./aluno.repository');
const presencaRepository = require('../presencas/presenca.repository');
const alertaService = require('../alertas/alerta.service'); // <-- O GATILHO DO ALERTA AQUI
const auditService = require('../auditoria/audit.service'); // <-- A CAIXA-PRETA AQUI
const AppError = require('../../utils/AppError');

class AlunoService {
  // Recebe o usuarioLogadoId para a auditoria
  async createAluno(data, usuarioLogadoId) {
    const alunoExistente = await alunoRepository.findByMatricula(data.matricula);
    if (alunoExistente) {
      throw new AppError('Já existe um aluno cadastrado com esta matrícula.', 400);
    }

    const novoAluno = await alunoRepository.create(data);

    // Auditoria
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'CREATE',
      entidade: 'Aluno',
      entidadeId: novoAluno.id,
      dadosNovos: novoAluno
    });

    return novoAluno;
  }

  async listarAlunos(pagina, limite) {
    return await alunoRepository.findAll(pagina, limite);
  }

  async buscarAlunoPorId(id) {
    const aluno = await alunoRepository.findById(id);
    if (!aluno || !aluno.ativo) {
      throw new AppError('Aluno não encontrado ou inativo no sistema.', 404);
    }
    return aluno;
  }

  async atualizarAluno(id, data, usuarioLogadoId) {
    const alunoAntigo = await this.buscarAlunoPorId(id);

    if (data.matricula) {
      const alunoExistente = await alunoRepository.findByMatricula(data.matricula);
      if (alunoExistente && alunoExistente.id !== id) {
        throw new AppError('Esta matrícula já está em uso por outro aluno.', 400);
      }
    }

    const alunoAtualizado = await alunoRepository.update(id, data);

    // Auditoria
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'UPDATE',
      entidade: 'Aluno',
      entidadeId: id,
      dadosAntigos: alunoAntigo,
      dadosNovos: alunoAtualizado
    });

    return alunoAtualizado;
  }

  async deletarAluno(id, usuarioLogadoId) {
    const alunoAntigo = await this.buscarAlunoPorId(id);
    const alunoDeletado = await alunoRepository.delete(id);

    // Auditoria
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'DELETE',
      entidade: 'Aluno',
      entidadeId: id,
      dadosAntigos: alunoAntigo
    });

    return alunoDeletado;
  }

  async calcularFrequenciaPercentual(id, dataInicio, dataFim) {
    await this.buscarAlunoPorId(id);
    const contagem = await presencaRepository.countByStatusAndAluno(id, dataInicio, dataFim);

    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;

    contagem.forEach(item => {
      if (item.status === 'PRESENTE') presentes = item._count._all;
      if (item.status === 'AUSENTE') ausentes = item._count._all;
      if (item.status === 'JUSTIFICADO') justificados = item._count._all;
    });

    const totalRegistros = presentes + ausentes + justificados;
    let porcentagem = 0;

    if (totalRegistros > 0) {
      porcentagem = ((presentes + justificados) / totalRegistros) * 100;
    }

    const frequenciaFinal = Number(porcentagem.toFixed(2));

    // -------------------------------------------------------------
    // O GATILHO DO ALERTA (Roda em background)
    // -------------------------------------------------------------
    if (totalRegistros > 5) { // Só dispara depois de 5 aulas registradas
      // Como a consulta é geral (sem turma específica), passamos 'GERAL' no lugar do turmaId
      alertaService.checarEGerarAlerta(id, 'GERAL', frequenciaFinal)
        .catch(err => console.error("Erro ao gerar alerta de evasão:", err.message));
    }

    return {
      alunoId: id,
      periodo: {
        inicio: dataInicio || 'Todo o histórico',
        fim: dataFim || 'Todo o histórico'
      },
      totalRegistros,
      detalhes: { presentes, ausentes, justificados },
      frequenciaPercentual: frequenciaFinal
    };
  }
  // O Direito ao Esquecimento (LGPD) - Exclui TUDO fisicamente do banco
  async exclusaoDefinitivaLGPD(id, usuarioLogadoId) {
    const aluno = await this.buscarAlunoPorId(id);
    const prisma = require('../../database/client');
    const auditService = require('../auditoria/audit.service');

    // O Prisma (com onDelete: Cascade) vai varrer todas as presenças, turmas e justificativas
    await prisma.aluno.delete({ where: { id } });

    // Registra na auditoria que os dados foram obliterados para provar conformidade
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'DELETE',
      entidade: 'Aluno_LGPD',
      entidadeId: id,
      dadosAntigos: { mensagem: "Dados pessoais completamente apagados conforme Direito ao Esquecimento (Art. 18, VI, LGPD)" }
    });

    return { message: 'Dados do aluno foram permanentemente apagados do sistema.' };
  }
}

module.exports = new AlunoService();