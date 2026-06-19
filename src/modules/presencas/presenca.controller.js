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
      const { presencas } = req.body; // O Flutter envia um array de presenças
      
      if (!presencas || !Array.isArray(presencas)) {
        return res.status(400).json({ error: 'Formato inválido. Esperado um array de presencas.' });
      }

      const prisma = require('../../database/client');
      
      // Insere todas as presenças de uma vezada só no banco
      const resultado = await prisma.presenca.createMany({
        data: presencas.map(p => ({
          alunoId: p.alunoId,
          turmaId: p.turmaId,
          disciplinaId: p.disciplinaId,
          status: p.status || 'PRESENTE',
          horarioEntrada: p.horarioEntrada ? new Date(p.horarioEntrada) : new Date(),
          origem: 'FLUTTER_OFFLINE'
        })),
        skipDuplicates: true // Evita quebrar se o app mandar a mesma presença duas vezes
      });

      return res.status(201).json({ 
        status: 'success', 
        message: `${resultado.count} presenças sincronizadas com sucesso.` 
      });
    } catch (error) {
      next(error);
    }
  }

  // Registrar Saída (Saída Antecipada)
  async registrarSaida(req, res, next) {
    try {
      const { id } = req.params;
      const prisma = require('../../database/client');

      const presencaAtualizada = await prisma.presenca.update({
        where: { id },
        data: {
          horarioSaida: new Date(),
          status: 'SAIDA_ANTECIPADA' // Atualiza o status automaticamente
        }
      });

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