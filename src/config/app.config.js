// Centraliza as configurações gerais da aplicação
module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiPrefix: '/api/v1',
  // Se no futuro o Victor ou o Miguel hospedarem o frontend em outro lugar,
  // você adiciona a URL deles aqui para o CORS liberar o acesso.
  corsOptions: {
    // Se a variável FRONTEND_URL existir, libera só ela. Se não, libera só o localhost (Miguel testando no PC dele)
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
};