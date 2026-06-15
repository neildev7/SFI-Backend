# 🏫 Attendance API - TCC Backend

Bem-vindo ao repositório oficial da API do Sistema de Chamadas com Reconhecimento Facial. 
Este backend foi construído com arquitetura modular, focando em segurança, escalabilidade e performance para suportar as requisições simultâneas do Frontend e do modelo de Inteligência Artificial.

## 👨‍💻 Equipe
* **Backend / Arquitetura:** Neil
* **Frontend (React/Flutter):** Miguel
* **UI/UX e Dashboards:** Victor
* **Inteligência Artificial (Python/OpenCV):** Pietro

## 🚀 Tecnologias Utilizadas
* **Node.js + Express:** Servidor e roteamento.
* **Prisma (ORM) + PostgreSQL:** Modelagem e acesso ao banco de dados relacional.
* **Zod:** Validação e sanitização de dados de entrada.
* **JSON Web Token (JWT):** Autenticação com Access e Refresh Tokens.
* **Node-Cron:** Automação de tarefas em background (Jobs).
* **DayJS:** Manipulação precisa de datas e fusos horários.
* **Winston:** Sistema profissional de logs.

---

## ⚙️ Como rodar o projeto localmente

Para que a API funcione na sua máquina, siga os passos abaixo rigorosamente.

### 1. Pré-requisitos
* Ter o [Node.js](https://nodejs.org/) instalado (versão 18+).
* Ter acesso a um banco de dados **PostgreSQL** rodando localmente ou na nuvem.

### 2. Instalação
Clone este repositório e instale as dependências:
```bash
npm install
3. Configuração das Variáveis de Ambiente
Crie um arquivo chamado .env na raiz do projeto (use o .env.example como base) e preencha as informações:

Snippet de código
PORT=3000
NODE_ENV=development

# URL do Banco de Dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/attendance_db?schema=public"

# Chaves JWT para o Frontend (Pode colocar qualquer texto em dev)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=sua_chave_secreta_refresh_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Chave de Comunicação com a IA (O Pietro precisa colocar a mesma chave no Python)
IA_API_KEY=super_chave_secreta_python_node_2026
4. Preparando o Banco de Dados
Com o PostgreSQL rodando e a DATABASE_URL configurada, execute os comandos do Prisma para criar as tabelas e injetar o usuário Administrador:

Bash
# Sincroniza as tabelas no banco de dados
npx prisma db push

# Cria o usuário Admin padrão para acesso inicial
npx prisma db seed
Credenciais geradas pelo Seed:
E-mail: admin@lorena.senai.br
Senha: admin123

5. Iniciando o Servidor
Para iniciar a API em modo de desenvolvimento (com auto-restart):

Bash
npm run dev
Se tudo der certo, você verá os logs do Winston no terminal indicando que o servidor e os Cron Jobs estão rodando na porta 3000.

🛡️ Funcionalidades e Regras de Negócio
Soft Delete: A exclusão de alunos, turmas ou disciplinas inativa o registro (ativo: false) para preservar o histórico de presenças.

Paginação: As rotas de listagem (GET /alunos, etc.) suportam os parâmetros ?page=X&limit=Y e retornam metadados completos.

Deduplicação de IA: Se a câmera capturar o mesmo rosto várias vezes no mesmo dia para a mesma turma, a API ignora os registros duplicados silenciosamente.

Refresh Token: O Frontend não desloga o usuário bruscamente. O sistema emite um token renovável de longo prazo.

Rate Limiting: A API bloqueia IPs que tentarem fazer mais de 100 requisições em 15 minutos (proteção contra DDoS/Força Bruta).

📌 Documentação de Rotas
A base da URL (Prefix) é http://localhost:3000/api/v1.

Módulos disponíveis:

/auth - Login e renovação de token.

/alunos - CRUD de alunos e cálculo de frequência.

/turmas - CRUD de turmas.

/disciplinas - CRUD de disciplinas.

/presencas - Registro manual e histórico.

/ia - Rotas blindadas por API Key para o backend Python.

/relatorios - Endpoints consolidados para os Dashboards (Cozinha, Secretaria, etc).