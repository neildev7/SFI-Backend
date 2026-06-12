const { z } = require('zod');

const registrarPresencaSchema = z.object({
  body: z.object({
    alunoId: z.string().uuid('O alunoId deve ser um UUID válido.'),
    turmaId: z.string().uuid('O turmaId deve ser um UUID válido.'),
    disciplinaId: z.string().uuid('O disciplinaId deve ser um UUID válido.').optional(),
    // O Zod restringe para que apenas estes três valores exatos sejam aceitos:
    status: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO'], {
      errorMap: () => ({ message: 'O status deve ser PRESENTE, AUSENTE ou JUSTIFICADO.' })
    }).optional()
  })
});

module.exports = {
  registrarPresencaSchema
};