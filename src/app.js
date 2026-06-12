const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');
const authRoutes = require('./modules/auth/auth.routes');
const alunoRoutes = require('./modules/alunos/aluno.routes');
const turmaRoutes = require('./modules/turmas/turma.routes');
const disciplinaRoutes = require('./modules/disciplinas/disciplina.routes');
const presencaRoutes = require('./modules/presencas/presenca.routes');
const iaRoutes = require('./modules/ia/ia.routes');
const relatorioRoutes = require('./modules/relatorios/relatorio.routes');

const app = express();

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================
app.use(helmet()); // Adiciona headers de segurança HTTP
app.use(cors()); // Permite requisições do frontend (React/Flutter)
app.use(express.json()); // Transforma o corpo das requisições (body) em JSON

// ==========================================
// HEALTH CHECK
// ==========================================
// Verifica se a API está de pé
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API do Sistema de Presença está rodando 🚀',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// ROTAS DA APLICAÇÃO
// ==========================================
app.use('/api/v1/auth', authRoutes); // Rota de login ativada!
app.use('/api/v1/alunos', alunoRoutes);
app.use('/api/v1/turmas', turmaRoutes);
app.use('/api/v1/disciplinas', disciplinaRoutes);
app.use('/api/v1/presencas', presencaRoutes);
app.use('/api/v1/ia', iaRoutes);
app.use('/api/v1/relatorios', relatorioRoutes);
// ==========================================
// TRATAMENTO DE ERROS E ROTAS INEXISTENTES
// ==========================================

// Tratamento para rotas não encontradas (404)
app.use((req, res, next) => {
  next(new AppError(`A rota ${req.originalUrl} não foi encontrada neste servidor.`, 404));
});

// Middleware Global de Erros (Sempre deve ser o último middleware)
app.use(errorHandler);

module.exports = app;