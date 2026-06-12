const dayjs = require('dayjs');

/**
 * Utilitário para centralizar a manipulação de datas na aplicação.
 */
class DateHelpers {
  /**
   * Retorna a data e hora atual.
   */
  static agora() {
    return dayjs().toDate();
  }

  /**
   * Retorna o exato primeiro segundo do dia de hoje (00:00:00).
   */
  static inicioDoDiaAtual() {
    return dayjs().startOf('day').toDate();
  }

  /**
   * Retorna o exato último segundo do dia de hoje (23:59:59).
   */
  static fimDoDiaAtual() {
    return dayjs().endOf('day').toDate();
  }

  /**
   * Formata uma data do banco para o padrão brasileiro de exibição no Dashboard.
   * Exemplo: '31/12/2026'
   */
  static formatarDataBr(data) {
    return dayjs(data).format('DD/MM/YYYY');
  }

  /**
   * Formata data e hora para o padrão brasileiro completo.
   * Exemplo: '31/12/2026 14:30:00'
   */
  static formatarDataHoraBr(data) {
    return dayjs(data).format('DD/MM/YYYY HH:mm:ss');
  }

  /**
   * Retorna a data atual marcando o horário limite da cozinha (10:00 AM).
   */
  static horarioDeCorteCozinha() {
    return dayjs().hour(10).minute(0).second(0).toDate();
  }
}

module.exports = DateHelpers;