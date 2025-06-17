const request = require('supertest');
const app = require('../server');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/usuarios/login')
    .send({ email: 'admin@example.com', senha: 'admin123' });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Financeiro API', () => {
  it('should list all financial records', async () => {
    const res = await request(app)
      .get('/api/financeiro')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new financial record', async () => {
    const res = await request(app)
      .post('/api/financeiro')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tipo: 'Receita',
        descricao: 'Teste financeiro',
        valor: 1000.0,
        data: '2024-01-01',
        imovelId: null,
        clienteId: null,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});
