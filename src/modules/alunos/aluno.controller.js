const alunoService = require('./aluno.service');

class AlunoController {
  async create(req, res, next) {
    try {
      // O Zod já garantiu que nome e matrícula existem e estão corretos!
      const { nome, matricula } = req.body;
      const novoAluno = await alunoService.createAluno({ nome, matricula });
      return res.status(201).json({ status: 'success', data: novoAluno });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      // 1. Pega a página da URL e converte para número (se vier vazio, o padrão é 1)
      const pagina = parseInt(req.query.page, 10) || 1;
      
      // 2. Pega o limite pedido. Se não mandar nada, o padrão é 10.
      const limiteSolicitado = parseInt(req.query.limit, 10) || 10;

      // 3. A TRAVA SÊNIOR: Pega o que o Miguel pediu, mas bloqueia no máximo em 100!
      const limiteSeguro = Math.min(limiteSolicitado, 100);

      // 4. Manda as variáveis blindadas para o Service buscar
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
      // Pega os parâmetros da URL usando req.query
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
      const alunoAtualizado = await alunoService.atualizarAluno(req.params.id, req.body);
      return res.status(200).json({ status: 'success', data: alunoAtualizado });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await alunoService.deletarAluno(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  
  async getFrequenciaDisciplinas(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query; // Permite filtros dinâmicos de período!
      const relatorio = await alunoService.calcularFrequenciaPorDisciplina(req.params.id, dataInicio, dataFim);
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlunoController();