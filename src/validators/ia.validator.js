const { z } = require('zod');

const registrarPresencaIaSchema = z.object({
  body: z.object({
    alunoId: z.string().uuid('O alunoId deve ser um UUID válido.'),
    turmaId: z.string().uuid('O turmaId deve ser um UUID válido.'),
    faceScore: z.number().min(0).max(1, 'O faceScore deve estar entre 0 e 1.').optional()
  })
});

module.exports = {
  registrarPresencaIaSchema
};