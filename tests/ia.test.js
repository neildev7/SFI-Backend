const request = require('supertest');
const app = require('../src/app'); // Importa a nossa configuração limpa do Express!

describe('Testes de Integração - Módulo IA', () => {
  
  it('Deve barrar o acesso à IA se a API KEY não for fornecida', async () => {
    const res = await request(app)
      .post('/api/v1/ia/registrar-presenca')
      .send({
        alunoId: 'fake-id',
        turmaId: 'fake-turma',
        faceScore: 0.99
      });

    // Esperamos um 401 Unauthorized porque o Zod e o Auth vão travar
    expect(res.statusCode).toEqual(401); 
    expect(res.body).toHaveProperty('error');
  });

  it('Health Check deve retornar status online', async () => {
    const res = await request(app).get('/api/v1/ia/health');
    // Pode retornar 200 (Python ligado) ou 503 (Python desligado), mas a rota NODE tem que existir
    expect([200, 503]).toContain(res.statusCode);
  });
});