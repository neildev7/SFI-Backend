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
    
    // 1. Mapeia o dia do JavaScript para o nosso Enum do Prisma
    const diasSemanaMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const diaAtualEnum = diasSemanaMap[agora.day()];

    if (diaAtualEnum === 'DOMINGO') {
      throw new AppError('Não há aulas agendadas para domingo.', 400);
    }

    // 2. Busca todos os horários daquela turma para o dia de hoje
    const gradeDoDia = await horarioRepository.findByTurmaEDia(turmaId, diaAtualEnum);
    
    // 3. Pega a hora atual no formato "HH:mm" (ex: "07:40")
    const horaAtualStr = agora.format('HH:mm');

    // 4. Percorre a grade para ver se a hora atual se encaixa em alguma janela de aula
    for (const horario of gradeDoDia) {
      // Define uma tolerância de 15 minutos antes da aula começar para o aluno bater o ponto na entrada
      const inicioComTolerancia = dayjs()
        .hour(horario.horaInicio.split(':')[0])
        .minute(horario.horaInicio.split(':')[1])
        .subtract(15, 'minute')
        .format('HH:mm');

      // O aluno pode registrar presença desde 15 min antes até o horário de término da aula
      if (horaAtualStr >= inicioComTolerancia && horaAtualStr <= horario.horaFim) {
        return horario.disciplinaId; // Encontrou a aula ativa! Retorna o ID da disciplina
      }
    }

    // Se saiu do laço e não achou nada, o aluno está tentando registrar presença fora do horário de aula
    throw new AppError('Fora da janela de horário permitido para esta turma.', 400);
  }
}

module.exports = new HorarioService();