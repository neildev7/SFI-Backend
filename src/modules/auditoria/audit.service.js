const prisma = require('../../database/client');

class AuditService {
  // Dispara o log de forma assíncrona ("fire and forget")
  async registrarLog({ usuarioId, acao, entidade, entidadeId, dadosAntigos, dadosNovos, ip }) {
    try {
      await prisma.auditLog.create({
        data: {
          usuarioId: usuarioId || null,
          acao,
          entidade,
          entidadeId: entidadeId || null,
          dadosAntigos: dadosAntigos || null,
          dadosNovos: dadosNovos || null,
          ip: ip || null
        }
      });
    } catch (error) {
      // Como é um log de background, nós apenas avisamos no console se der erro, 
      // para não quebrar a funcionalidade principal do usuário.
      console.error('🚨 [AUDITORIA] Falha ao registrar AuditLog:', error.message);
    }
  }
}

module.exports = new AuditService();