const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('O formato do e-mail é inválido.').nonempty('O e-mail é obrigatório.'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').nonempty('A senha é obrigatória.')
  })
});

module.exports = {
  loginSchema
};