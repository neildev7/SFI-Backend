const prisma = require('../../database/client');

class AuthRepository {
  // Busca o usuário pelo e-mail
  async findUserByEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email }
    });
  }
}

module.exports = new AuthRepository();