const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../server');
const prisma = new PrismaClient();

describe('API de Artigos', () => {
  let token;
  let adminToken;
  let artigoId;
  let categoriaId;

  beforeAll(async () => {
    // Criar usuário admin para testes
    const adminResponse = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'admin@teste.com',
        senha: 'senha123'
      });

    adminToken = adminResponse.body.token;

    // Criar categoria para testes
    const categoria = await prisma.categoria.create({
      data: {
        nome: 'Categoria Teste'
      }
    });
    categoriaId = categoria.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.artigo.deleteMany({
      where: {
        titulo: {
          contains: 'Teste'
        }
      }
    });
    await prisma.categoria.delete({
      where: {
        id: categoriaId
      }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/artigos', () => {
    it('deve listar artigos publicados', async () => {
      const response = await request(app)
        .get('/api/artigos')
        .expect(200);

      expect(Array.isArray(response.body.artigos)).toBe(true);
      expect(response.body).toHaveProperty('paginas');
      expect(response.body).toHaveProperty('total');
    });

    it('deve filtrar artigos por categoria', async () => {
      const response = await request(app)
        .get('/api/artigos')
        .query({ categoria: 'Categoria Teste' })
        .expect(200);

      expect(Array.isArray(response.body.artigos)).toBe(true);
    });

    it('deve buscar artigos por texto', async () => {
      const response = await request(app)
        .get('/api/artigos')
        .query({ busca: 'teste' })
        .expect(200);

      expect(Array.isArray(response.body.artigos)).toBe(true);
    });
  });

  describe('POST /api/artigos', () => {
    it('deve criar um novo artigo', async () => {
      const artigo = {
        titulo: 'Artigo de Teste',
        conteudo: 'Conteúdo do artigo de teste com mais de 100 caracteres para passar na validação. Este é um texto longo o suficiente.',
        categorias: [{ id: categoriaId, nome: 'Categoria Teste' }],
        metaTitle: 'Meta Title Teste',
        metaDescription: 'Meta Description Teste',
        publicado: true
      };

      const response = await request(app)
        .post('/api/artigos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(artigo)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe(artigo.titulo);
      expect(response.body.urlAmigavel).toBe('artigo-de-teste');

      artigoId = response.body.id;
    });

    it('deve validar campos obrigatórios', async () => {
      const artigo = {
        titulo: '',
        conteudo: '',
        categorias: []
      };

      const response = await request(app)
        .post('/api/artigos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(artigo)
        .expect(400);

      expect(response.body.erros).toBeDefined();
      expect(response.body.erros.length).toBeGreaterThan(0);
    });

    it('deve negar acesso sem autenticação', async () => {
      const artigo = {
        titulo: 'Teste Sem Auth',
        conteudo: 'Conteúdo teste',
        categorias: [{ id: categoriaId }]
      };

      await request(app)
        .post('/api/artigos')
        .send(artigo)
        .expect(401);
    });
  });

  describe('GET /api/artigos/:urlAmigavel', () => {
    it('deve buscar um artigo por URL amigável', async () => {
      const response = await request(app)
        .get('/api/artigos/artigo-de-teste')
        .expect(200);

      expect(response.body.titulo).toBe('Artigo de Teste');
      expect(response.body.visualizacoes).toBe(1);
    });

    it('deve retornar 404 para artigo não encontrado', async () => {
      await request(app)
        .get('/api/artigos/artigo-inexistente')
        .expect(404);
    });
  });

  describe('PUT /api/artigos/:id', () => {
    it('deve atualizar um artigo existente', async () => {
      const atualizacao = {
        titulo: 'Artigo de Teste Atualizado',
        conteudo: 'Novo conteúdo do artigo de teste com mais de 100 caracteres para passar na validação. Este é um texto atualizado.',
        categorias: [{ id: categoriaId, nome: 'Categoria Teste' }],
        publicado: true
      };

      const response = await request(app)
        .put(`/api/artigos/${artigoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(atualizacao)
        .expect(200);

      expect(response.body.titulo).toBe(atualizacao.titulo);
      expect(response.body.urlAmigavel).toBe('artigo-de-teste-atualizado');
    });

    it('deve negar atualização sem autenticação', async () => {
      await request(app)
        .put(`/api/artigos/${artigoId}`)
        .send({ titulo: 'Teste' })
        .expect(401);
    });
  });

  describe('DELETE /api/artigos/:id', () => {
    it('deve excluir um artigo', async () => {
      await request(app)
        .delete(`/api/artigos/${artigoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar se o artigo foi realmente excluído
      const response = await request(app)
        .get(`/api/artigos/${artigoId}`)
        .expect(404);
    });

    it('deve negar exclusão sem autenticação', async () => {
      await request(app)
        .delete(`/api/artigos/${artigoId}`)
        .expect(401);
    });
  });

  describe('GET /api/artigos/categorias', () => {
    it('deve listar categorias com contagem de artigos', async () => {
      const response = await request(app)
        .get('/api/artigos/categorias')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('_count');
      expect(response.body[0]._count).toHaveProperty('artigos');
    });
  });

  describe('POST /api/upload/imagem', () => {
    it('deve fazer upload de imagem', async () => {
      const buffer = Buffer.from('fake image content');

      const response = await request(app)
        .post('/api/upload/imagem')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('imagem', buffer, 'test.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toMatch(/^\/uploads\/blog\//);
    });

    it('deve validar tipo de arquivo', async () => {
      const buffer = Buffer.from('fake text content');

      await request(app)
        .post('/api/upload/imagem')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('imagem', buffer, 'test.txt')
        .expect(400);
    });
  });
});
