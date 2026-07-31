const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // 1. Cria a Turma
  const turma3A = await prisma.turma.create({
    data: {
      nome: '3º Ano A - Desenvolvimento',
      anoLetivo: 2026,
      turno: 'MANHA',
      ativo: true,
    },
  });
  console.log(`✅ Turma criada: ${turma3A.nome} (ID: ${turma3A.id})`);

  // 2. Lista de Alunos para inserir
  const listaAlunos = [
    {
      nome: 'Neil Lopes João Filho',
      matricula: 'SENAI2026001',
      fotoTreinamento: 'NEILLOPESJOAOFILHO_1.jpg'
    },
    {
      nome: 'Pietro Andrade',
      matricula: 'SENAI2026002',
      fotoTreinamento: 'PIETRO_1.jpg'
    },
    {
      nome: 'Ana Clara Souza',
      matricula: 'SENAI2026003',
      fotoTreinamento: 'ANA_1.jpg'
    }
  ];

  // 3. Insere os alunos e já cria a relação na tabela TurmaAluno
  for (const alunoData of listaAlunos) {
    const aluno = await prisma.aluno.create({
      data: {
        nome: alunoData.nome,
        matricula: alunoData.matricula,
        fotoTreinamento: alunoData.fotoTreinamento,
        ativo: true,
        // Cria a relação N:M automaticamente
        turmas: {
          create: {
            turmaId: turma3A.id
          }
        }
      }
    });
    console.log(`👤 Aluno criado: ${aluno.nome}`);
    console.log(`   ID: ${aluno.id}`);
  }

  console.log('\n🚀 Seed concluído! Atualize o seu mapeamento_alunos.json no Python com os IDs gerados acima.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });