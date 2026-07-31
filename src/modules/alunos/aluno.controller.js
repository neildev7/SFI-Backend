const alunoService = require('./aluno.service');

class AlunoController {
  async create(req, res, next) {
    try {
      const { nome, matricula } = req.body;
      // CORREÇÃO: Passando o req.usuario.id para a auditoria!
      const novoAluno = await alunoService.createAluno({ nome, matricula }, req.usuario.id);
      return res.status(201).json({ status: 'success', data: novoAluno });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const pagina = parseInt(req.query.page, 10) || 1;
      const limiteSolicitado = parseInt(req.query.limit, 10) || 10;
      const limiteSeguro = Math.min(limiteSolicitado, 100);

      const resultado = await alunoService.listarAlunos(pagina, limiteSeguro);
      
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const aluno = await alunoService.buscarAlunoPorId(req.params.id);
      return res.status(200).json({ status: 'success', data: aluno });
    } catch (error) {
      next(error);
    }
  }

  async getFrequencia(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await alunoService.calcularFrequenciaPercentual(
        req.params.id, 
        dataInicio, 
        dataFim
      );
      return res.status(200).json({ status: 'success', data: estatisticas });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // CORREÇÃO: Passando o req.usuario.id para a auditoria!
      const alunoAtualizado = await alunoService.atualizarAluno(req.params.id, req.body, req.usuario.id);
      return res.status(200).json({ status: 'success', data: alunoAtualizado });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      // CORREÇÃO: Passando o req.usuario.id para a auditoria!
      await alunoService.deletarAluno(req.params.id, req.usuario.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async getFrequenciaDisciplinas(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query; 
      const relatorio = await alunoService.calcularFrequenciaPorDisciplina(req.params.id, dataInicio, dataFim);
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlunoController();