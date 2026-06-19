const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Sistema de Presença Escolar (SENAI)',
      version: '1.0.0',
      description: 'Documentação oficial da API de reconhecimento facial e frequência.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Aponta para as pastas onde estão suas rotas para ele ler os comentários
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.controller.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;