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
const appConfig = require('./config/app.config');
const requestLogger = require('./middlewares/requestLogger');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================
app.use(helmet()); // Adiciona headers de segurança HTTP
app.use(cors(appConfig.corsOptions)); // Permite requisições do frontend (React/Flutter)
app.use(express.json()); // Transforma o corpo das requisições (body) em JSON
app.use(requestLogger); // Registra as requisições
app.use(rateLimiter); // Aplica o rate limiting

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
// ==========================================
// ROTAS DA APLICAÇÃO
// ==========================================
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/alunos`, alunoRoutes);
app.use(`${appConfig.apiPrefix}/turmas`, turmaRoutes);
app.use(`${appConfig.apiPrefix}/disciplinas`, disciplinaRoutes);
app.use(`${appConfig.apiPrefix}/presencas`, presencaRoutes);
app.use(`${appConfig.apiPrefix}/ia`, iaRoutes);
app.use(`${appConfig.apiPrefix}/relatorios`, relatorioRoutes);0
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