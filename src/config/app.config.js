// Centraliza as configurações gerais da aplicação
module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiPrefix: '/api/v1',
  // Se no futuro o Victor ou o Miguel hospedarem o frontend em outro lugar,
  // você adiciona a URL deles aqui para o CORS liberar o acesso.
  corsOptions: {
    origin: '*', // Em produção, mude para a URL exata do frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
};