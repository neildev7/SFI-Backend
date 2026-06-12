const { z } = require('zod');

const createAlunoSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').nonempty('O nome é obrigatório.'),
    matricula: z.string().min(5, 'A matrícula deve ter no mínimo 5 caracteres.').nonempty('A matrícula é obrigatória.'),
    fotoTreinamento: z.string().url('A foto de treinamento deve ser uma URL válida.').optional()
  })
});

const updateAlunoSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').optional(),
    matricula: z.string().min(5, 'A matrícula deve ter no mínimo 5 caracteres.').optional(),
    fotoTreinamento: z.string().url('A foto de treinamento deve ser uma URL válida.').optional()
  })
});

module.exports = {
  createAlunoSchema,
  updateAlunoSchema
};