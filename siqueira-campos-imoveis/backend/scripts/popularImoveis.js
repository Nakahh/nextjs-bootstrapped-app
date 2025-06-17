const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const caracteristicas = [
  { nome: 'Piscina', icone: 'fas fa-swimming-pool' },
  { nome: 'Academia', icone: 'fas fa-dumbbell' },
  { nome: 'Churrasqueira', icone: 'fas fa-fire' },
  { nome: 'Área de Lazer', icone: 'fas fa-volleyball-ball' },
  { nome: 'Playground', icone: 'fas fa-child' },
  { nome: 'Salão de Festas', icone: 'fas fa-glass-cheers' },
  { nome: 'Segurança 24h', icone: 'fas fa-shield-alt' },
  { nome: 'Elevador', icone: 'fas fa-elevator' },
  { nome: 'Portaria', icone: 'fas fa-door-closed' },
  { nome: 'Jardim', icone: 'fas fa-leaf' },
  { nome: 'Ar Condicionado', icone: 'fas fa-snowflake' },
  { nome: 'Internet Fibra', icone: 'fas fa-wifi' }
];

const imagens = [
  // Apartamentos
  [
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg',
    'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'
  ],
  [
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    'https://images.pexels.com/photos/1643385/pexels-photo-1643385.jpeg',
    'https://images.pexels.com/photos/1643386/pexels-photo-1643386.jpeg'
  ],
  // Casas
  [
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    'https://images.pexels.com/photos/106400/pexels-photo-106400.jpeg',
    'https://images.pexels.com/photos/106401/pexels-photo-106401.jpeg'
  ],
  [
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    'https://images.pexels.com/photos/323781/pexels-photo-323781.jpeg',
    'https://images.pexels.com/photos/323782/pexels-photo-323782.jpeg'
  ]
];

const bairros = [
  'Setor Bueno',
  'Setor Oeste',
  'Setor Marista',
  'Jardim Goiás',
  'Setor Sul',
  'Setor Nova Suíça',
  'Setor Pedro Ludovico',
  'Parque Amazônia'
];

async function main() {
  try {
    // Criar usuário admin
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@example.com',
        senha: await bcrypt.hash('admin123', 10),
        papel: 'ADMIN',
        telefone: '(62) 98556-3905'
      }
    });

    // Criar corretores
    const corretores = await Promise.all([
      prisma.usuario.create({
        data: {
          nome: 'João Silva',
          email: 'joao.silva@example.com',
          senha: await bcrypt.hash('corretor123', 10),
          papel: 'CORRETOR',
          telefone: '(62) 98556-3906',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
        }
      }),
      prisma.usuario.create({
        data: {
          nome: 'Maria Santos',
          email: 'maria.santos@example.com',
          senha: await bcrypt.hash('corretor123', 10),
          papel: 'CORRETOR',
          telefone: '(62) 98556-3907',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
        }
      })
    ]);

    // Criar características
    const caracteristicasCriadas = await Promise.all(
      caracteristicas.map((c) =>
        prisma.caracteristica.create({
          data: c
        })
      )
    );

    // Criar imóveis
    const imoveis = [];
    const tipos = ['CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL'];
    const status = ['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO', 'LANCAMENTO'];
    const tiposNegocio = ['VENDA', 'ALUGUEL', 'VENDA_ALUGUEL'];

    for (let i = 0; i < 20; i++) {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const tipoNegocio = tiposNegocio[Math.floor(Math.random() * tiposNegocio.length)];
      const statusImovel = status[Math.floor(Math.random() * status.length)];
      const corretor = corretores[Math.floor(Math.random() * corretores.length)];
      const bairro = bairros[Math.floor(Math.random() * bairros.length)];
      const imagensImovel = imagens[Math.floor(Math.random() * imagens.length)];
      const caracteristicasImovel = caracteristicasCriadas
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 6) + 3);

      const precoBase = Math.floor(Math.random() * 900000) + 100000;
      const area = Math.floor(Math.random() * 300) + 50;
      const quartos = tipo === 'CASA' || tipo === 'APARTAMENTO' ? Math.floor(Math.random() * 4) + 1 : 0;
      const suites = quartos > 0 ? Math.floor(Math.random() * quartos) : 0;
      const vagas = tipo === 'CASA' || tipo === 'APARTAMENTO' ? Math.floor(Math.random() * 4) + 1 : 0;

      const imovel = await prisma.imovel.create({
        data: {
          titulo: `${tipo === 'CASA' ? 'Casa' : tipo === 'APARTAMENTO' ? 'Apartamento' : tipo === 'TERRENO' ? 'Terreno' : 'Sala Comercial'} em ${bairro}`,
          descricao: `Excelente ${tipo.toLowerCase()} localizado no ${bairro}, com ${area}m² de área total. ${
            tipo === 'CASA' || tipo === 'APARTAMENTO'
              ? `Possui ${quartos} quartos, sendo ${suites} suítes, e ${vagas} vagas de garagem.`
              : ''
          } Localização privilegiada, próximo a comércios, escolas e transporte público.`,
          tipo,
          status: statusImovel,
          tipoNegocio,
          precoVenda: tipoNegocio !== 'ALUGUEL' ? precoBase : null,
          precoAluguel: tipoNegocio !== 'VENDA' ? Math.floor(precoBase * 0.004) : null,
          area,
          quartos,
          suites,
          banheiros: quartos > 0 ? quartos + 1 : 1,
          vagas,
          mobiliado: Math.random() > 0.7,
          destaque: Math.random() > 0.8,
          urlAmigavel: `${tipo.toLowerCase()}-${bairro.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
          corretorId: corretor.id,
          endereco: {
            create: {
              cep: '74000-000',
              logradouro: 'Rua dos Exemplos',
              numero: String(Math.floor(Math.random() * 1000) + 1),
              bairro,
              cidade: 'Goiânia',
              estado: 'GO',
              latitude: -16.6869 + (Math.random() - 0.5) * 0.1,
              longitude: -49.2648 + (Math.random() - 0.5) * 0.1
            }
          },
          imagens: {
            create: imagensImovel.map((url, index) => ({
              url,
              ordem: index
            }))
          },
          caracteristicas: {
            create: caracteristicasImovel.map((c) => ({
              caracteristicaId: c.id
            }))
          }
        }
      });

      imoveis.push(imovel);
    }

    console.log('Dados de exemplo criados com sucesso!');
    console.log(`- ${imoveis.length} imóveis`);
    console.log(`- ${caracteristicasCriadas.length} características`);
    console.log(`- ${corretores.length} corretores`);
    console.log('- 1 administrador');

  } catch (erro) {
    console.error('Erro ao criar dados de exemplo:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

main();
