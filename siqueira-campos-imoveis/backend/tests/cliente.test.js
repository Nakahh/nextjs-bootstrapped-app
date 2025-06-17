const request = require('supertest');
const app = require('../server'); // Ajuste conforme o arquivo principal do servidor

describe('Cliente API', () => {
  let clienteId;

  it('Deve criar um novo cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        telefone: '123456789',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    clienteId = res.body.id;
  });

  it('Deve adicionar contato ao cliente', async () => {
    const res = await request(app)
      .post(`/api/clientes/${clienteId}/contatos`)
      .send({
        tipo: 'ligação',
        descricao: 'Contato inicial',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('Deve listar contatos do cliente', async () => {
    const res = await request(app).get(`/api/clientes/${clienteId}/contatos`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Deve adicionar tag ao cliente', async () => {
    const res = await request(app)
      .post(`/api/clientes/${clienteId}/tags`)
      .send({
        nome: 'VIP',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('Deve listar tags do cliente', async () => {
    const res = await request(app).get(`/api/clientes/${clienteId}/tags`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
