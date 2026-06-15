const alunoRepository = require('./aluno.repository');
const presencaRepository = require('../presencas/presenca.repository');
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

  async listarAlunos(pagina, limite) {
    return await alunoRepository.findAll(pagina, limite);
  }

 async buscarAlunoPorId(id) {
    const aluno = await alunoRepository.findById(id);
    
    // Se o aluno não existir OU estiver inativo (deletado), dá erro.
    if (!aluno || !aluno.ativo) {
      throw new AppError('Aluno não encontrado ou inativo no sistema.', 404);
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

  // Agora aceita dataInicio e dataFim
  async calcularFrequenciaPercentual(id, dataInicio, dataFim) {
    // 1. Garante que o aluno existe
    await this.buscarAlunoPorId(id);

    // 2. Busca a contagem agrupada no banco já com o recorte de tempo
    const contagem = await presencaRepository.countByStatusAndAluno(id, dataInicio, dataFim);

    let presentes = 0;
    let ausentes = 0;
    let justificados = 0;

    // 3. Separa os valores
    contagem.forEach(item => {
      if (item.status === 'PRESENTE') presentes = item._count._all;
      if (item.status === 'AUSENTE') ausentes = item._count._all;
      if (item.status === 'JUSTIFICADO') justificados = item._count._all;
    });

    const totalRegistros = presentes + ausentes + justificados;
    let porcentagem = 0;

    // 4. Calcula a porcentagem
    if (totalRegistros > 0) {
      porcentagem = ((presentes + justificados) / totalRegistros) * 100;
    }

    // 5. Devolve o pacote super completo para o frontend
    return {
      alunoId: id,
      periodo: {
        inicio: dataInicio || 'Todo o histórico',
        fim: dataFim || 'Todo o histórico'
      },
      totalRegistros,
      detalhes: {
        presentes,
        ausentes,
        justificados
      },
      frequenciaPercentual: Number(porcentagem.toFixed(2))
    };
  }
}

module.exports = new AlunoService();