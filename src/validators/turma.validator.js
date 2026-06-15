const { z } = require('zod');

const createTurmaSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome da turma é obrigatório.' })
      .min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    // O Zod exige que seja um número (ex: 2026) e não uma string ("2026")
    anoLetivo: z.number({ required_error: 'O ano letivo é obrigatório.', invalid_type_error: 'O ano letivo deve ser um número.' })
      .int('O ano letivo deve ser um número inteiro.')
      .min(2024, 'O ano letivo não pode ser inferior a 2024.')
  })
});

const updateTurmaSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.').optional(),
    anoLetivo: z.number().int().min(2024).optional()
  })
});

module.exports = {
  createTurmaSchema,
  updateTurmaSchema
};