const request = require('supertest');
const app = require('../server');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

describe('Testes de Imóveis', () => {
  let adminToken;
  let corretorToken;
  let imovelTeste;
  let usuarioAdmin;
  let usuarioCorretor;

  beforeAll(async () => {
    // Criar usuário admin
    usuarioAdmin = await prisma.usuario.create({
      data: {
        nome: 'Admin Teste',
        email: 'admin.teste@example.com',
        senha: await bcrypt.hash('senha123', 10),
        papel: 'ADMIN'
      }
    });

    // Criar usuário corretor
    usuarioCorretor = await prisma.usuario.create({
      data: {
        nome: 'Corretor Teste',
        email: 'corretor.teste@example.com',
        senha: await bcrypt.hash('senha123', 10),
        papel: 'CORRETOR'
      }
    });

    // Gerar tokens
    adminToken = jwt.sign(
      { id: usuarioAdmin.id, papel: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    corretorToken = jwt.sign(
      { id: usuarioCorretor.id, papel: 'CORRETOR' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.historicoPreco.deleteMany();
    await prisma.caracteristicasImovel.deleteMany();
    await prisma.imagemImovel.deleteMany();
    await prisma.endereco.deleteMany();
    await prisma.imovel.deleteMany();
    await prisma.caracteristica.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /imoveis', () => {
    it('deve listar imóveis com paginação', async () => {
      const response = await request(app)
        .get('/api/imoveis')
        .query({ pagina: 1, limite: 12 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imoveis');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('paginas');
    });

    it('deve filtrar imóveis corretamente', async () => {
      const response = await request(app)
        .get('/api/imoveis')
        .query({
          tipo: 'CASA',
          cidade: 'Goiânia',
          precoMin: 200000,
          precoMax: 500000
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.imoveis)).toBe(true);
    });
  });

  describe('POST /imoveis', () => {
    const novoImovel = {
      titulo: 'Casa Nova em Goiânia',
      descricao: 'Linda casa com 3 quartos',
      tipo: 'CASA',
      status: 'DISPONIVEL',
      tipoNegocio: 'VENDA',
      precoVenda: 450000,
      area: 200,
      quartos: 3,
      suites: 1,
      banheiros: 2,
      vagas: 2,
      mobiliado: false,
      destaque: true,
      endereco: {
        cep: '74000-000',
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Setor Oeste',
        cidade: 'Goiânia',
        estado: 'GO'
      },
      imagens: [
        {
          url: 'https://exemplo.com/imagem1.jpg',
          legenda: 'Fachada'
        }
      ],
      caracteristicas: [
        {
          nome: 'Piscina'
        }
      ]
    };

    it('deve criar um novo imóvel como admin', async () => {
      const response = await request(app)
        .post('/api/imoveis')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(novoImovel);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      imovelTeste = response.body;
    });

    it('deve criar um novo imóvel como corretor', async () => {
      const response = await request(app)
        .post('/api/imoveis')
        .set('Authorization', `Bearer ${corretorToken}`)
        .send(novoImovel);

      expect(response.status).toBe(201);
    });

    it('deve rejeitar criação sem autenticação', async () => {
      const response = await request(app)
        .post('/api/imoveis')
        .send(novoImovel);

      expect(response.status).toBe(401);
    });

    it('deve validar dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/imoveis')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erros');
    });
  });

  describe('GET /imoveis/:urlAmigavel', () => {
    it('deve buscar imóvel por URL amigável', async () => {
      const response = await request(app)
        .get(`/api/imoveis/${imovelTeste.urlAmigavel}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', imovelTeste.id);
    });

    it('deve retornar 404 para imóvel não encontrado', async () => {
      const response = await request(app)
        .get('/api/imoveis/imovel-inexistente');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /imoveis/:id', () => {
    it('deve atualizar imóvel como admin', async () => {
      const response = await request(app)
        .put(`/api/imoveis/${imovelTeste.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...imovelTeste,
          titulo: 'Título Atualizado',
          precoVenda: 460000
        });

      expect(response.status).toBe(200);
      expect(response.body.titulo).toBe('Título Atualizado');
    });

    it('deve rejeitar atualização sem autenticação', async () => {
      const response = await request(app)
        .put(`/api/imoveis/${imovelTeste.id}`)
        .send({
          ...imovelTeste,
          titulo: 'Título Atualizado'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /imoveis/caracteristicas/listar', () => {
    it('deve listar características disponíveis', async () => {
      const response = await request(app)
        .get('/api/imoveis/caracteristicas/listar');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /imoveis/:id/historico-precos', () => {
    it('deve listar histórico de preços', async () => {
      const response = await request(app)
        .get(`/api/imoveis/${imovelTeste.id}/historico-precos`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /imoveis/:id', () => {
    it('deve rejeitar exclusão por corretor', async () => {
      const response = await request(app)
        .delete(`/api/imoveis/${imovelTeste.id}`)
        .set('Authorization', `Bearer ${corretorToken}`);

      expect(response.status).toBe(403);
    });

    it('deve permitir exclusão por admin', async () => {
      const response = await request(app)
        .delete(`/api/imoveis/${imovelTeste.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });
});
