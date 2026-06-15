const { z } = require('zod');

const registrarPresencaIaSchema = z.object({
  body: z.object({
    alunoId: z.string().uuid('O alunoId deve ser um UUID válido.'),
    turmaId: z.string().uuid('O turmaId deve ser um UUID válido.'),
    disciplinaId: z.string().uuid('O disciplinaId deve ser um UUID válido.').optional()
  })
});

module.exports = {
  registrarPresencaIaSchema
};