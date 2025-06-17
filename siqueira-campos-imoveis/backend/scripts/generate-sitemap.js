const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function generateSitemap() {
  try {
    // Buscar todas as URLs necessárias
    const [imoveis, artigos] = await Promise.all([
      prisma.imovel.findMany({
        where: { deletadoEm: null },
        select: {
          urlAmigavel: true,
          atualizadoEm: true
        }
      }),
      prisma.artigo.findMany({
        where: { publicado: true },
        select: {
          urlAmigavel: true,
          atualizadoEm: true
        }
      })
    ]);

    const baseUrl = 'https://siqueiracamposimoveis.com.br';
    
    // Páginas estáticas
    const staticPages = [
      '',
      '/imoveis',
      '/blog',
      '/contato',
      '/sobre',
      '/equipe',
      '/politicas',
      '/ajuda',
      '/simulador',
      '/area-cliente'
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${imoveis.map(imovel => `
  <url>
    <loc>${baseUrl}/imoveis/${imovel.urlAmigavel}</loc>
    <lastmod>${imovel.atualizadoEm.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  
  ${artigos.map(artigo => `
  <url>
    <loc>${baseUrl}/blog/${artigo.urlAmigavel}</loc>
    <lastmod>${artigo.atualizadoEm.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    // Salvar o sitemap
    await fs.writeFile(
      path.join(__dirname, '../../frontend/public/sitemap.xml'),
      sitemap
    );

    console.log('Sitemap gerado com sucesso!');
    
    // Gerar robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Áreas administrativas
Disallow: /admin/*
Disallow: /login
Disallow: /register
`;

    await fs.writeFile(
      path.join(__dirname, '../../frontend/public/robots.txt'),
      robotsTxt
    );

    console.log('Robots.txt gerado com sucesso!');

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap;
