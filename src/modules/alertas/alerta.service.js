const prisma = require('../../database/client');

// A linha de corte do MEC
const LIMITE_FREQUENCIA = 75.0; 

class AlertaService {
  // Essa função será chamada automaticamente pelo sistema
  async checarEGerarAlerta(alunoId, turmaId, frequenciaAtual) {
    // Se a frequência está boa, não faz nada
    if (frequenciaAtual >= LIMITE_FREQUENCIA) return;

    // Verifica se já existe um alerta não resolvido para não floodar o banco
    const alertaExistente = await prisma.alerta.findFirst({
      where: {
        alunoId,
        turmaId,
        resolvido: false
      }
    });

    if (!alertaExistente) {
      await prisma.alerta.create({
        data: {
          alunoId,
          turmaId,
          mensagem: `Risco de Evasão: Frequência do aluno caiu para ${frequenciaAtual}% (abaixo do limite de ${LIMITE_FREQUENCIA}%).`
        }
      });
    }
  }

  // Para o Victor listar os alertas no dashboard da Secretaria
  async listarAlertasAtivos() {
    return await prisma.alerta.findMany({
      where: { resolvido: false },
      include: {
        aluno: { select: { nome: true, matricula: true } },
        turma: { select: { nome: true } }
      },
      orderBy: { criadoEm: 'desc' }
    });
  }

  // Para a secretaria marcar que já resolveu (ex: ligou pros pais)
  async resolverAlerta(alertaId) {
    return await prisma.alerta.update({
      where: { id: alertaId },
      data: { resolvido: true }
    });
  }
}

module.exports = new AlertaService();