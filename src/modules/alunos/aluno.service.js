const alunoRepository = require('./aluno.repository');
const presencaRepository = require('../presencas/presenca.repository');
const alertaService = require('../alertas/alerta.service'); 
const auditService = require('../auditoria/audit.service'); 
const AppError = require('../../utils/AppError');
const prisma = require('../../database/client'); // <-- Importado para buscar os nomes das disciplinas no relatório

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

  // -------------------------------------------------------------
  // 1. Cálculo Geral de Frequência (Atualizado com todos os status e Flag de Risco)
  // -------------------------------------------------------------
  async calcularFrequenciaPercentual(id, dataInicio, dataFim) {
    await this.buscarAlunoPorId(id);
    const contagem = await presencaRepository.countByStatusAndAluno(id, dataInicio, dataFim);

    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;
    let atrasos = 0;
    let saidasAntecipadas = 0;

    contagem.forEach(item => {
      if (item.status === 'PRESENTE') presentes = item._count._all;
      if (item.status === 'AUSENTE') ausentes = item._count._all;
      if (item.status === 'JUSTIFICADO') justificados = item._count._all;
      if (item.status === 'ATRASO') atrasos = item._count._all;
      if (item.status === 'SAIDA_ANTECIPADA') saidasAntecipadas = item._count._all;
    });

    // Soma todas as aulas que deveriam ter sido assistidas no período
    const totalAulasPrevistas = presentes + ausentes + justificados + atrasos + saidasAntecipadas;
    let porcentagem = 100.0; // Caso não tenha registros no período, inicia em 100%

    if (totalAulasPrevistas > 0) {
      // Legalmente: Presenças, Justificativas, Atrasos e Saídas Antecipadas contam como comparecimento letivo
      porcentagem = ((presentes + justificados + atrasos + saidasAntecipadas) / totalAulasPrevistas) * 100;
    }

    const frequenciaFinal = Number(porcentagem.toFixed(2));
    
    // Flag de risco automática conforme as normas da LDB (Mínimo 75%)
    const statusRisco = frequenciaFinal < 75.0 ? 'EM_RISCO' : 'REGULAR';

    // O GATILHO DO ALERTA (Roda em background se houver amostragem suficiente)
    if (totalAulasPrevistas > 5) { 
      alertaService.checarEGerarAlerta(id, 'GERAL', frequenciaFinal)
        .catch(err => console.error("Erro ao gerar alerta de evasão:", err.message));
    }

    return {
      alunoId: id,
      statusRisco,
      periodo: {
        inicio: dataInicio || 'Todo o histórico',
        fim: dataFim || 'Todo o histórico'
      },
      totalAulasPrevistas,
      detalhes: { presentes, ausentes, justificados, atrasos, saidasAntecipadas },
      frequenciaPercentual: frequenciaFinal
    };
  }

  // -------------------------------------------------------------
  // 2. CORRIGIDO (BO 6): Relatório de Frequência detalhado POR DISCIPLINA
  // -------------------------------------------------------------
  async calcularFrequenciaPorDisciplina(id, dataInicio, dataFim) {
    await this.buscarAlunoPorId(id);
    
    // Busca dados consolidados e agrupados do repositório
    const registros = await presencaRepository.countAgrupadoPorDisciplina(id, dataInicio, dataFim);
    const mapaDisciplinas = {};

    registros.forEach(item => {
      const discId = item.disciplinaId || 'SEM_DISCIPLINA';
      if (!mapaDisciplinas[discId]) {
        mapaDisciplinas[discId] = { presentes: 0, ausentes: 0, justificados: 0, atrasos: 0, saidasAntecipadas: 0 };
      }
      
      if (item.status === 'PRESENTE') mapaDisciplinas[discId].presentes = item._count._all;
      if (item.status === 'AUSENTE') mapaDisciplinas[discId].ausentes = item._count._all;
      if (item.status === 'JUSTIFICADO') mapaDisciplinas[discId].justificados = item._count._all;
      if (item.status === 'ATRASO') mapaDisciplinas[discId].atrasos = item._count._all;
      if (item.status === 'SAIDA_ANTECIPADA') mapaDisciplinas[discId].saidasAntecipadas = item._count._all;
    });

    const relatorioFinal = [];

    for (const [disciplinaId, dados] of Object.entries(mapaDisciplinas)) {
      const totalAulas = dados.presentes + dados.ausentes + dados.justificados + dados.atrasos + dados.saidasAntecipadas;
      const pct = totalAulas > 0 ? ((dados.presentes + dados.justificados + dados.atrasos + dados.saidasAntecipadas) / totalAulas) * 100 : 100;
      
      let nomeDisciplina = 'Módulo Geral';
      if (disciplinaId !== 'SEM_DISCIPLINA') {
         const disciplina = await prisma.disciplina.findUnique({ where: { id: disciplinaId } });
         if (disciplina) nomeDisciplina = disciplina.nome;
      }

      relatorioFinal.push({
        disciplinaId,
        nomeDisciplina,
        totalAulasPrevistas: totalAulas,
        frequenciaPercentual: Number(pct.toFixed(2)),
        statusRisco: pct < 75.0 ? 'EM_RISCO' : 'REGULAR'
      });
    }

    return relatorioFinal;
  }

  // -------------------------------------------------------------
  // 3. O Direito ao Esquecimento (LGPD) - Exclui TUDO fisicamente do banco
  // -------------------------------------------------------------
  async exclusaoDefinitivaLGPD(id, usuarioLogadoId) {
    const aluno = await this.buscarAlunoPorId(id);

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