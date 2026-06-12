const relatorioService = require('./relatorio.service');

class RelatorioController {
  async getCozinha(req, res, next) {
    try {
      const relatorio = await relatorioService.gerarRelatorioCozinha();
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }

  async getSecretaria(req, res, next) {
    try {
      const relatorio = await relatorioService.gerarRelatorioSecretaria();
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }

  async getDiario(req, res, next) {
    try {
      const relatorio = await relatorioService.gerarRelatorioDiario();
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }

  async getMensal(req, res, next) {
    try {
      const relatorio = await relatorioService.gerarRelatorioMensal();
      return res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RelatorioController();