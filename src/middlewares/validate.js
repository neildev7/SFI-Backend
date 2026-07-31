const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Verifica se o erro veio da validação do Zod (se possui issues)
    if (error.issues) {
      // O PULO DO GATO: Agora usamos error.issues no lugar de error.errors
      const mensagensErro = error.issues.map((issue) => {
        // Junta o caminho do campo (ex: 'aluno.nome') com a mensagem de erro
        const campo = issue.path.length > 0 ? `${issue.path.join('.')} - ` : '';
        return `${campo}${issue.message}`;
      });

      return res.status(400).json({
        status: 'error',
        message: 'Falha na validação dos dados enviados.',
        erros: mensagensErro
      });
    }
    
    // Se não for um erro do Zod, repassa para o errorHandler global (Erro 500 real)
    next(error);
  }
};

module.exports = validate;