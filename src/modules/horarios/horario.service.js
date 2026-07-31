const horarioRepository = require('./horario.repository');
const dayjs = require('dayjs');
const AppError = require('../../utils/AppError');

class HorarioService {
  async cadastrarHorario(data) {
    return await horarioRepository.create(data);
  }

  async listarTodos() {
    return await horarioRepository.findAll();
  }

  // Adicione isso na classe HorarioService
  async atualizarHorario(id, data, usuarioLogadoId) {
    const horarioRepository = require('./horario.repository');
    const auditService = require('../auditoria/audit.service');
    const AppError = require('../../utils/AppError');

    const horarioAntigo = await horarioRepository.findById(id);
    if (!horarioAntigo) {
      throw new AppError('Horário não encontrado.', 404);
    }

    const horarioAtualizado = await horarioRepository.update(id, data);

    // LGPD - Rastreador de quem mexeu na grade de aulas
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'UPDATE',
      entidade: 'Horario',
      entidadeId: id,
      dadosAntigos: horarioAntigo,
      dadosNovos: horarioAtualizado
    });

    return horarioAtualizado;
  }

  async deletarHorario(id, usuarioLogadoId) {
    const horarioRepository = require('./horario.repository');
    const auditService = require('../auditoria/audit.service');
    const AppError = require('../../utils/AppError');

    const horarioAntigo = await horarioRepository.findById(id);
    if (!horarioAntigo) {
      throw new AppError('Horário não encontrado.', 404);
    }

    const horarioDeletado = await horarioRepository.delete(id);

    // LGPD
    auditService.registrarLog({
      usuarioId: usuarioLogadoId,
      acao: 'DELETE',
      entidade: 'Horario',
      entidadeId: id,
      dadosAntigos: horarioAntigo
    });

    return horarioDeletado;
  }

  // O CORAÇÃO DA VALIDAÇÃO: Descobre qual aula está acontecendo AGORA
  async validarEObterDisciplinaAtual(turmaId) {
    const agora = dayjs();
    
    const diasSemanaMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const diaAtualEnum = diasSemanaMap[agora.day()];

    if (diaAtualEnum === 'DOMINGO') {
      throw new AppError('Não há aulas agendadas para domingo.', 400);
    }

    const gradeDoDia = await horarioRepository.findByTurmaEDia(turmaId, diaAtualEnum);
    const horaAtualStr = agora.format('HH:mm');

    for (const horario of gradeDoDia) {
      // O aluno pode registrar entrada até 15 minutos antes do sinal bater
      const inicioComTolerancia = dayjs()
        .hour(horario.horaInicio.split(':')[0])
        .minute(horario.horaInicio.split(':')[1])
        .subtract(15, 'minute')
        .format('HH:mm');
        
      // O limite para não ganhar atraso são 15 minutos APÓS o sinal bater
      const limitePresencaNormal = dayjs()
        .hour(horario.horaInicio.split(':')[0])
        .minute(horario.horaInicio.split(':')[1])
        .add(15, 'minute')
        .format('HH:mm');

      // Se está dentro da janela da aula (desde os 15 min antes até o final da aula)
      if (horaAtualStr >= inicioComTolerancia && horaAtualStr <= horario.horaFim) {
        
        // Descobre se ele chegou a tempo ou atrasado
        const statusCalculado = (horaAtualStr <= limitePresencaNormal) ? 'PRESENTE' : 'ATRASO';

        return {
          disciplinaId: horario.disciplinaId,
          statusCalculado: statusCalculado
        };
      }
    }

    throw new AppError('Fora da janela de horário permitido para as aulas desta turma.', 400);
  }

  // Verifica se o aluno está a sair antes do horário permitido
  async validarStatusSaida(turmaId, disciplinaId) {
    const agora = dayjs();
    const horaAtualStr = agora.format('HH:mm');

    const diasSemanaMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const diaAtualEnum = diasSemanaMap[agora.day()];

    // 1. Busca o horário desta disciplina para a turma no dia de hoje
    const prisma = require('../../database/client');
    const horario = await prisma.horario.findFirst({
      where: { turmaId, disciplinaId, diaSemana: diaAtualEnum, ativo: true }
    });

    if (!horario) return null;

    // 2. Define a linha de corte: 10 minutos antes do fim da aula
    const limiteSaidaNormal = dayjs()
      .hour(horario.horaFim.split(':')[0])
      .minute(horario.horaFim.split(':')[1])
      .subtract(10, 'minute')
      .format('HH:mm');

    // 3. Se a hora atual for menor que o limite, o aluno fugiu mais cedo!
    if (horaAtualStr < limiteSaidaNormal) {
      return 'SAIDA_ANTECIPADA';
    }

    return null; // Saída normal, mantém o status de PRESENTE/ATRASO que já tinha
  }

  // Verifica se a saída está acontecendo antes do fim da ÚLTIMA aula do dia (modelo dia inteiro)
  async validarStatusSaidaDia(turmaId) {
    const agora = dayjs();
    const horaAtualStr = agora.format('HH:mm');

    const diasSemanaMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const diaAtualEnum = diasSemanaMap[agora.day()];

    const gradeDoDia = await horarioRepository.findByTurmaEDia(turmaId, diaAtualEnum);

    if (!gradeDoDia || gradeDoDia.length === 0) {
      // Sem grade cadastrada pra hoje: não dá pra avaliar, trata como saída normal
      return null;
    }

    const fimDaUltimaAula = gradeDoDia.reduce(
      (maisTarde, horario) => (horario.horaFim > maisTarde ? horario.horaFim : maisTarde),
      '00:00'
    );

    const limiteSaidaNormal = dayjs()
      .hour(fimDaUltimaAula.split(':')[0])
      .minute(fimDaUltimaAula.split(':')[1])
      .subtract(10, 'minute')
      .format('HH:mm');

    if (horaAtualStr < limiteSaidaNormal) {
      return 'SAIDA_ANTECIPADA';
    }

    return null;
  }
}

module.exports = new HorarioService();