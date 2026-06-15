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
}

module.exports = new HorarioService();