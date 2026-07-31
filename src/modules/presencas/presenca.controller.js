const presencaService = require('./presenca.service');

class PresencaController {
  async create(req, res, next) {
    try {
      // O Zod já validou se os IDs são UUIDs autênticos e se o status está correto
      const { alunoId, turmaId, disciplinaId, status } = req.body;

      const novaPresenca = await presencaService.registrarPresencaManual({
        alunoId,
        turmaId,
        disciplinaId,
        status 
      });

      return res.status(201).json({ status: 'success', data: novaPresenca });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      // Pega os parâmetros da query string (se não vierem, a API assume 1 e 10)
      const pagina = req.query.page || 1;
      const limite = req.query.limit || 10;

      const resultado = await presencaService.listarTodas(pagina, limite);
      
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async getByAluno(req, res, next) {
    try {
      const presencas = await presencaService.listarPorAluno(req.params.id);
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async getByTurma(req, res, next) {
    try {
      const presencas = await presencaService.listarPorTurma(req.params.id);
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async getHoje(req, res, next) {
    try {
      const presencas = await presencaService.listarPresencasHoje();
      return res.status(200).json({ status: 'success', data: presencas });
    } catch (error) {
      next(error);
    }
  }

  async registrarPresencaManual(req, res, next) {
    try {
      // Pega os dados enviados pelo Front-end (Secretaria/Professor)
      const { alunoId, turmaId, disciplinaId, status, origem } = req.body;
      
      const presencaService = require('./presenca.service');
      
      const novaPresenca = await presencaService.registrarPresencaManual({
        alunoId,
        turmaId,
        disciplinaId,
        status: status || 'PRESENTE',
        origem: origem || 'MANUAL'
      });

      return res.status(201).json({ 
        status: 'success', 
        message: 'Presença manual registrada com sucesso.',
        data: novaPresenca 
      });
    } catch (error) {
      next(error);
    }
  }

  // Sincronização em Lote (Offline Sync para o Flutter)
  async sincronizarBatch(req, res, next) {
    try {
      const { lote } = req.body;
      
      // Proteção contra payload maluco
      if (!lote || !Array.isArray(lote)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'O formato do lote está incorreto. Esperava um array de presenças.' 
        });
      }

      const presencaRepository = require('./presenca.repository');
      
      // Repassa o lote pro nosso novo método blindado!
      const resultado = await presencaRepository.sincronizarBatchOffline(lote);

      return res.status(200).json({ 
        status: 'success', 
        message: 'Sincronização offline concluída com sucesso.',
        resumo: resultado 
      });
    } catch (error) {
      next(error);
    }
  }

  // Registrar Saída (Saída Antecipada)
  async registrarSaida(req, res, next) {
    try {
      const { id } = req.params; // ID da presença na URL
      const { status } = req.body; // ex: 'SAIDA_ANTECIPADA' ou 'PRESENTE'
      
      const presencaService = require('./presenca.service');

      // Delega o trabalho pesado para o Service
      const presencaAtualizada = await presencaService.registrarSaida(id, status);

      return res.status(200).json({ 
        status: 'success', 
        message: 'Saída registrada com sucesso.',
        data: presencaAtualizada
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new PresencaController();