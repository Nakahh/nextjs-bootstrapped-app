const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const artigos = [
  {
    titulo: 'Como escolher o imóvel ideal para investimento',
    conteudo: `
      <h2>Fatores importantes na escolha de um imóvel para investimento</h2>
      <p>Investir em imóveis é uma das formas mais tradicionais e seguras de garantir um bom retorno financeiro a longo prazo. No entanto, é fundamental fazer uma análise criteriosa antes de tomar a decisão.</p>
      
      <h3>1. Localização</h3>
      <p>A localização é um dos fatores mais importantes na valorização do imóvel. Considere:</p>
      <ul>
        <li>Proximidade de transportes públicos</li>
        <li>Acesso a comércio e serviços</li>
        <li>Segurança da região</li>
        <li>Desenvolvimento do bairro</li>
      </ul>

      <h3>2. Potencial de valorização</h3>
      <p>Pesquise sobre projetos futuros para a região, como:</p>
      <ul>
        <li>Novas linhas de transporte</li>
        <li>Centros comerciais</li>
        <li>Melhorias na infraestrutura</li>
      </ul>

      <h3>3. Análise financeira</h3>
      <p>Faça um estudo detalhado considerando:</p>
      <ul>
        <li>Preço do imóvel x média da região</li>
        <li>Potencial de aluguel</li>
        <li>Custos de manutenção</li>
        <li>Impostos e taxas</li>
      </ul>
    `,
    categorias: [
      { nome: 'Investimentos' },
      { nome: 'Mercado Imobiliário' }
    ],
    metaTitle: 'Guia: Como escolher o melhor imóvel para investimento',
    metaDescription: 'Aprenda os principais fatores a considerar na hora de escolher um imóvel para investimento. Dicas práticas para maximizar seu retorno.',
    publicado: true
  },
  {
    titulo: 'Tendências do mercado imobiliário para 2024',
    conteudo: `
      <h2>O que esperar do mercado imobiliário em 2024</h2>
      <p>O mercado imobiliário está em constante evolução, e 2024 promete trazer mudanças significativas no setor.</p>

      <h3>1. Sustentabilidade</h3>
      <p>A preocupação com o meio ambiente está cada vez mais presente:</p>
      <ul>
        <li>Energia solar</li>
        <li>Reaproveitamento de água</li>
        <li>Materiais ecológicos</li>
        <li>Certificações ambientais</li>
      </ul>

      <h3>2. Tecnologia</h3>
      <p>Inovações que estão transformando o setor:</p>
      <ul>
        <li>Casa inteligente (Smart Home)</li>
        <li>Realidade virtual para visitas</li>
        <li>Documentação digital</li>
      </ul>

      <h3>3. Novos formatos de moradia</h3>
      <p>Tendências que vieram para ficar:</p>
      <ul>
        <li>Coworking e coliving</li>
        <li>Apartamentos compactos</li>
        <li>Condomínios com mais áreas comuns</li>
      </ul>
    `,
    categorias: [
      { nome: 'Mercado Imobiliário' },
      { nome: 'Tendências' }
    ],
    metaTitle: 'Tendências do mercado imobiliário para 2024 | Análise completa',
    metaDescription: 'Descubra as principais tendências do mercado imobiliário para 2024. Sustentabilidade, tecnologia e novos formatos de moradia em destaque.',
    publicado: true
  },
  {
    titulo: 'Documentos necessários para comprar um imóvel',
    conteudo: `
      <h2>Lista completa de documentos para compra de imóvel</h2>
      <p>A compra de um imóvel é um processo que exige atenção aos documentos necessários para garantir a segurança da transação.</p>

      <h3>1. Documentos pessoais</h3>
      <ul>
        <li>RG e CPF</li>
        <li>Comprovante de residência</li>
        <li>Certidão de estado civil</li>
        <li>Comprovante de renda</li>
      </ul>

      <h3>2. Documentos do imóvel</h3>
      <ul>
        <li>Matrícula atualizada</li>
        <li>IPTU quitado</li>
        <li>Certidão negativa de débitos</li>
        <li>Declaração de quitação de condomínio</li>
      </ul>

      <h3>3. Documentos do vendedor</h3>
      <ul>
        <li>Certidões negativas</li>
        <li>Documentos pessoais</li>
        <li>Procuração (se necessário)</li>
      </ul>
    `,
    categorias: [
      { nome: 'Documentação' },
      { nome: 'Compra e Venda' }
    ],
    metaTitle: 'Documentos para comprar imóvel: Lista completa e atualizada',
    metaDescription: 'Confira a lista completa de documentos necessários para comprar um imóvel. Guia prático com todos os documentos pessoais e do imóvel.',
    publicado: true
  }
];

async function popularArtigos() {
  try {
    console.log('Iniciando população de artigos...');

    for (const artigo of artigos) {
      const { categorias, ...dadosArtigo } = artigo;

      // Criar ou conectar categorias
      const categoriasConectadas = await Promise.all(
        categorias.map(async (categoria) => {
          const categoriaExistente = await prisma.categoria.upsert({
            where: { nome: categoria.nome },
            update: {},
            create: { nome: categoria.nome }
          });
          return categoriaExistente;
        })
      );

      // Criar artigo com categorias
      await prisma.artigo.create({
        data: {
          ...dadosArtigo,
          categorias: {
            connect: categoriasConectadas.map(c => ({ id: c.id }))
          }
        }
      });

      console.log(`Artigo criado: ${artigo.titulo}`);
    }

    console.log('População de artigos concluída com sucesso!');
  } catch (erro) {
    console.error('Erro ao popular artigos:', erro);
  } finally {
    await prisma.$disconnect();
  }
}

popularArtigos();
