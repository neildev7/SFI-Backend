const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o plantio do Seed...');

  // Criptografa a senha antes de salvar
  const senhaHash = await bcrypt.hash('admin123', 10);

  // O upsert é perfeito aqui: ele tenta achar o usuário. Se não achar, ele cria.
  // Se você rodar o seed duas vezes por engano, ele não duplica o admin!
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@lorena.senai.br' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      email: 'admin@lorena.senai.br',
      senha: senhaHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed executado com sucesso!');
  console.log(`👤 Admin criado: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });