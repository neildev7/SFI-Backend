const relatorioService = require('./relatorio.service');
const { Parser } = require('json2csv');

class RelatorioController {
  
  // Função utilitária interna para gerar o arquivo CSV
  enviarResposta(res, dados, formato, nomeArquivo) {
    if (formato === 'csv') {
      try {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(dados);
        res.header('Content-Type', 'text/csv');
        res.attachment(`${nomeArquivo}.csv`);
        return res.send(csv);
      } catch (err) {
        return res.status(500).json({ error: 'Erro ao gerar arquivo CSV.' });
      }
    }
    // Se não pediu CSV, retorna o JSON padrão para o dashboard do Victor
    return res.status(200).json({ status: 'success', data: dados });
  }

  async getCozinha(req, res, next) {
    try {
      const { data, format } = req.query;
      const relatorio = await relatorioService.previsaoCozinha(data);
      // Formata os dados para o CSV ficar bonito caso solicitado
      const dadosPlanilha = [{ Data: relatorio.data, ...relatorio.previsao }];
      
      return new RelatorioController().enviarResposta(res, dadosPlanilha, format, 'relatorio_cozinha');
    } catch (error) { next(error); }
  }

  async getAusentes(req, res, next) {
    try {
      const { data, turmaId, format } = req.query;
      if (!turmaId) return res.status(400).json({ error: 'turmaId é obrigatório.' });
      
      const ausentes = await relatorioService.listarAusentes(turmaId, data);
      return new RelatorioController().enviarResposta(res, ausentes, format, 'lista_ausentes');
    } catch (error) { next(error); }
  }

  async getBaixaFrequencia(req, res, next) {
    try {
      const { limiar, dataInicio, dataFim, format } = req.query;
      const alunos = await relatorioService.listarAlunosBaixaFrequencia(limiar, dataInicio, dataFim);
      
      return new RelatorioController().enviarResposta(res, alunos, format, 'alunos_em_risco');
    } catch (error) { next(error); }
  }
}

module.exports = new RelatorioController();