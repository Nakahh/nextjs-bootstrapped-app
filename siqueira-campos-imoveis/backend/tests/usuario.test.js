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

describe('Usuario API', () => {
  it('should login user and return token', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'admin@example.com', senha: 'admin123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should list all users', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
