const { z } = require('zod');

// Lista fechada de opções para o Zod validar
const turnosPermitidos = ['MANHA', 'TARDE', 'NOITE', 'INTEGRAL'];

const createTurmaSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome da turma é obrigatório.' })
      .min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    anoLetivo: z.number({ required_error: 'O ano letivo é obrigatório.', invalid_type_error: 'O ano letivo deve ser um número.' })
      .int('O ano letivo deve ser um número inteiro.')
      .min(2024, 'O ano letivo não pode ser inferior a 2024.'),
    // NOVO: Validação do turno
    turno: z.enum(turnosPermitidos, {
      required_error: 'O turno é obrigatório.',
      invalid_type_error: `O turno deve ser um dos seguintes: ${turnosPermitidos.join(', ')}`
    })
  })
});

const updateTurmaSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    anoLetivo: z.number().int().min(2024).optional(),
    turno: z.enum(turnosPermitidos).optional() // NOVO AQUI TAMBÉM
  })
});

module.exports = {
  createTurmaSchema,
  updateTurmaSchema
};