const prisma = require('../../database/client');
const auditService = require('../auditoria/audit.service');
const AppError = require('../../utils/AppError');

class JustificativaService {
  async registrarJustificativa(data, usuarioLogadoId) {
    const { presencaId, motivo, anexoUrl } = data;

    // 1. Verifica se o registro de presença (a falta) realmente existe
    const presenca = await prisma.presenca.findUnique({ where: { id: presencaId } });
    
    if (!presenca) {
      throw new AppError('Registro de presença/falta não encontrado.', 404);
    }
    if (presenca.status !== 'AUSENTE') {
      throw new AppError('Só é possível justificar registros que estão como AUSENTE.', 400);
    }

    // 2. Transação do Prisma (Faz as duas coisas ao mesmo tempo. Se uma falhar, cancela tudo)
    const [novaJustificativa, presencaAtualizada] = await prisma.$transaction([
      // Cria o atestado
      prisma.justificativa.create({
        data: {
          presencaId,
          motivo,
          anexoUrl: anexoUrl || null,
          aprovadoPor: usuarioLogadoId // Salva quem foi o funcionário
        }
      }),
      // Altera a falta para justificada
      prisma.presenca.update({
        where: { id: presencaId },
        data: { status: 'JUSTIFICADO' }
      })
    ]);

    // 3. O RASTRO DE AUDITORIA (A LGPD agindo!)
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'UPDATE',
      entidade: 'Presenca_Justificada',
      entidadeId: presencaId,
      dadosAntigos: presenca,
      dadosNovos: presencaAtualizada
    });

    return { justificativa: novaJustificativa, presenca: presencaAtualizada };
  }
}

module.exports = new JustificativaService();