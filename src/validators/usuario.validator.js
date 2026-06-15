const { z } = require('zod');

// Cargos permitidos conforme o seu schema.prisma
const rolesPermitidos = ['ADMIN', 'PROFESSOR', 'SECRETARIA', 'COZINHA', 'SISTEMA_IA'];

const createUsuarioSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome é obrigatório.' }).min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    email: z.string({ required_error: 'O e-mail é obrigatório.' }).email('Formato de e-mail inválido.'),
    senha: z.string({ required_error: 'A senha é obrigatória.' }).min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    role: z.enum(rolesPermitidos, { required_error: 'O perfil de acesso (role) é obrigatório.' })
  })
});

const updateUsuarioSchema = z.object({
  body: z.object({
    nome: z.string().min(3).optional(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    role: z.enum(rolesPermitidos).optional(),
    ativo: z.boolean().optional()
  })
});

module.exports = { createUsuarioSchema, updateUsuarioSchema };