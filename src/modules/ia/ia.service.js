const alunoService = require('../alunos/aluno.service');
const presencaService = require('../presencas/presenca.service');
const AppError = require('../../utils/AppError');

class IaService {
  async processarReconhecimento(data) {
    const { alunoId, turmaId, disciplinaId } = data;

    // 1. Confirma se o aluno realmente existe (se o Pietro mandar um ID fantasma, barramos aqui)
    const aluno = await alunoService.buscarAlunoPorId(alunoId);

    // 2. Aqui poderíamos ter regras de negócio específicas da IA.
    // Exemplo: Verificar se a última presença desse aluno foi há menos de 5 minutos 
    // para evitar que o sistema registre a presença duas vezes seguidas se ele ficar parado na frente da câmera.

    // 3. Registra a presença usando o módulo que já criamos
    const novaPresenca = await presencaService.registrarPresencaManual({
      alunoId,
      turmaId,
      disciplinaId,
      status: 'PRESENTE' // A IA sempre registra como presente
    });

    return {
      aluno: aluno.nome,
      presenca: novaPresenca
    };
  }

  async validarFaceAluno(arquivoImagem) {
    // Este método servirá para o fluxo inverso: 
    // Quando o frontend enviar uma foto no momento da matrícula,
    // o Node.js usará o 'axios' para mandar essa foto para o Python treinar o rosto.
    
    /* Exemplo futuro de implementação:
    const axios = require('axios');
    const respostaPython = await axios.post('http://url-do-pietro/treinar', { imagem: arquivoImagem });
    return respostaPython.data;
    */
    
    return { mensagem: 'Função de treinamento a ser implementada na integração final.' };
  }
}

module.exports = new IaService();