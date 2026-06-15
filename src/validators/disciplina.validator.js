const { z } = require('zod');

const createDisciplinaSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome da disciplina é obrigatório.' })
      .min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    codigo: z.string({ required_error: 'O código da disciplina é obrigatório.' })
      .min(2, 'O código deve ter pelo menos 2 caracteres.')
      .toUpperCase() // Zod converte automaticamente para maiúsculo (ex: mat101 vira MAT101)
  })
});

const updateDisciplinaSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    codigo: z.string().min(2).toUpperCase().optional()
  })
});

module.exports = {
  createDisciplinaSchema,
  updateDisciplinaSchema
};