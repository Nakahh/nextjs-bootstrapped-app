const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const prisma = new PrismaClient();

// Função auxiliar para gerar URL amigável única
async function gerarUrlAmigavel(titulo, id = '') {
  let urlBase = slugify(titulo, {
    lower: true,
    strict: true,
    locale: 'pt'
  });

  let url = urlBase;
  let contador = 1;
  let imovelExistente;

  // Verifica se já existe um imóvel com esta URL
  do {
    imovelExistente = await prisma.imovel.findUnique({
      where: {
        urlAmigavel: url,
        NOT: { id }
      }
    });

    if (imovelExistente) {
      url = `${urlBase}-${contador}`;
      contador++;
    }
  } while (imovelExistente);

  return url;
}

// Função auxiliar para formatar endereço
function formatarEndereco(endereco) {
  if (!endereco) return null;
  
  return {
    create: {
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      latitude: endereco.latitude ? parseFloat(endereco.latitude) : null,
      longitude: endereco.longitude ? parseFloat(endereco.longitude) : null
    }
  };
}

// Função auxiliar para formatar imagens
function formatarImagens(imagens) {
  if (!imagens?.length) return undefined;
  
  return {
    create: imagens.map((img, index) => ({
      url: img.url,
      legenda: img.legenda,
      ordem: img.ordem || index
    }))
  };
}

// Função auxiliar para formatar características
function formatarCaracteristicas(caracteristicas) {
  if (!caracteristicas?.length) return undefined;
  
  return {
    create: caracteristicas.map(c => ({
      caracteristica: {
        connectOrCreate: {
          where: { id: c.id || '' },
          create: { nome: c.nome, icone: c.icone }
        }
      }
    }))
  };
}

const imovelController = {
  // Listar imóveis com filtros
  async listar(req, res) {
    try {
      const {
        tipo,
        status,
        tipoNegocio,
        cidade,
        bairro,
        precoMin,
        precoMax,
        areaMin,
        areaMax,
        quartos,
        suites,
        vagas,
        mobiliado,
        destaque,
        busca,
        pagina = 1,
        limite = 12,
        ordem = 'recentes'
      } = req.query;

      // Construir filtros
      const where = {
        deletadoEm: null,
        ...(tipo && { tipo }),
        ...(status && { status }),
        ...(tipoNegocio && { tipoNegocio }),
        ...(mobiliado !== undefined && { mobiliado: mobiliado === 'true' }),
        ...(destaque !== undefined && { destaque: destaque === 'true' }),
        ...(quartos && { quartos: { gte: parseInt(quartos) } }),
        ...(suites && { suites: { gte: parseInt(suites) } }),
        ...(vagas && { vagas: { gte: parseInt(vagas) } }),
        ...(precoMin && {
          OR: [
            { precoVenda: { gte: parseFloat(precoMin) } },
            { precoAluguel: { gte: parseFloat(precoMin) } }
          ]
        }),
        ...(precoMax && {
          OR: [
            { precoVenda: { lte: parseFloat(precoMax) } },
            { precoAluguel: { lte: parseFloat(precoMax) } }
          ]
        }),
        ...(areaMin && { area: { gte: parseInt(areaMin) } }),
        ...(areaMax && { area: { lte: parseInt(areaMax) } }),
        ...(cidade && {
          endereco: {
            cidade: { contains: cidade, mode: 'insensitive' }
          }
        }),
        ...(bairro && {
          endereco: {
            bairro: { contains: bairro, mode: 'insensitive' }
          }
        }),
        ...(busca && {
          OR: [
            { titulo: { contains: busca, mode: 'insensitive' } },
            { descricao: { contains: busca, mode: 'insensitive' } },
            {
              endereco: {
                OR: [
                  { bairro: { contains: busca, mode: 'insensitive' } },
                  { cidade: { contains: busca, mode: 'insensitive' } }
                ]
              }
            }
          ]
        })
      };

      // Ordenação
      const orderBy = {
        recentes: { criadoEm: 'desc' },
        antigos: { criadoEm: 'asc' },
        precoMaior: [
          { precoVenda: 'desc' },
          { precoAluguel: 'desc' }
        ],
        precoMenor: [
          { precoVenda: 'asc' },
          { precoAluguel: 'asc' }
        ],
        areaMaior: { area: 'desc' },
        areaMenor: { area: 'asc' },
        visualizacoes: { visualizacoes: 'desc' }
      }[ordem] || { criadoEm: 'desc' };

      // Buscar total de registros
      const total = await prisma.imovel.count({ where });

      // Buscar imóveis
      const imoveis = await prisma.imovel.findMany({
        where,
        include: {
          endereco: true,
          imagens: {
            orderBy: { ordem: 'asc' },
            take: 1
          },
          caracteristicas: {
            include: {
              caracteristica: true
            }
          },
          corretor: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              avatar: true
            }
          }
        },
        orderBy,
        skip: (pagina - 1) * limite,
        take: limite
      });

      res.json({
        imoveis,
        total,
        paginas: Math.ceil(total / limite)
      });
    } catch (erro) {
      console.error('Erro ao listar imóveis:', erro);
      res.status(500).json({ erro: 'Erro ao listar imóveis' });
    }
  },

  // Buscar imóvel por URL amigável
  async buscarPorUrl(req, res) {
    try {
      const { urlAmigavel } = req.params;

      const imovel = await prisma.imovel.findUnique({
        where: { urlAmigavel },
        include: {
          endereco: true,
          imagens: {
            orderBy: { ordem: 'asc' }
          },
          caracteristicas: {
            include: {
              caracteristica: true
            }
          },
          corretor: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              avatar: true
            }
          }
        }
      });

      if (!imovel) {
        return res.status(404).json({ erro: 'Imóvel não encontrado' });
      }

      // Incrementar visualizações
      await prisma.imovel.update({
        where: { id: imovel.id },
        data: { visualizacoes: { increment: 1 } }
      });

      // Buscar imóveis relacionados
      const imoveisRelacionados = await prisma.imovel.findMany({
        where: {
          OR: [
            { tipo: imovel.tipo },
            {
              endereco: {
                bairro: imovel.endereco.bairro
              }
            }
          ],
          NOT: { id: imovel.id },
          deletadoEm: null
        },
        include: {
          endereco: true,
          imagens: {
            orderBy: { ordem: 'asc' },
            take: 1
          }
        },
        take: 3
      });

      res.json({ ...imovel, imoveisRelacionados });
    } catch (erro) {
      console.error('Erro ao buscar imóvel:', erro);
      res.status(500).json({ erro: 'Erro ao buscar imóvel' });
    }
  },

  // Criar imóvel
  async criar(req, res) {
    try {
      const {
        titulo,
        descricao,
        tipo,
        status,
        tipoNegocio,
        precoVenda,
        precoAluguel,
        area,
        quartos,
        suites,
        banheiros,
        vagas,
        mobiliado,
        destaque,
        endereco,
        imagens,
        caracteristicas,
        corretorId
      } = req.body;

      const urlAmigavel = await gerarUrlAmigavel(titulo);

      const imovel = await prisma.imovel.create({
        data: {
          titulo,
          descricao,
          tipo,
          status,
          tipoNegocio,
          precoVenda: precoVenda ? parseFloat(precoVenda) : null,
          precoAluguel: precoAluguel ? parseFloat(precoAluguel) : null,
          area: parseInt(area),
          quartos: parseInt(quartos),
          suites: suites ? parseInt(suites) : null,
          banheiros: parseInt(banheiros),
          vagas: vagas ? parseInt(vagas) : null,
          mobiliado,
          destaque,
          urlAmigavel,
          endereco: formatarEndereco(endereco),
          imagens: formatarImagens(imagens),
          caracteristicas: formatarCaracteristicas(caracteristicas),
          ...(corretorId && { corretor: { connect: { id: corretorId } } })
        },
        include: {
          endereco: true,
          imagens: true,
          caracteristicas: {
            include: {
              caracteristica: true
            }
          },
          corretor: true
        }
      });

      res.status(201).json(imovel);
    } catch (erro) {
      console.error('Erro ao criar imóvel:', erro);
      res.status(500).json({ erro: 'Erro ao criar imóvel' });
    }
  },

  // Atualizar imóvel
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        tipo,
        status,
        tipoNegocio,
        precoVenda,
        precoAluguel,
        area,
        quartos,
        suites,
        banheiros,
        vagas,
        mobiliado,
        destaque,
        endereco,
        imagens,
        caracteristicas,
        corretorId
      } = req.body;

      // Verificar se imóvel existe
      const imovelExistente = await prisma.imovel.findUnique({
        where: { id }
      });

      if (!imovelExistente) {
        return res.status(404).json({ erro: 'Imóvel não encontrado' });
      }

      // Gerar nova URL amigável se título mudou
      const urlAmigavel = titulo !== imovelExistente.titulo
        ? await gerarUrlAmigavel(titulo, id)
        : imovelExistente.urlAmigavel;

      // Registrar alteração de preço se houver
      if (precoVenda !== imovelExistente.precoVenda || precoAluguel !== imovelExistente.precoAluguel) {
        await prisma.historicoPreco.create({
          data: {
            imovelId: id,
            tipoNegocio,
            valor: precoVenda || precoAluguel
          }
        });
      }

      const imovel = await prisma.imovel.update({
        where: { id },
        data: {
          titulo,
          descricao,
          tipo,
          status,
          tipoNegocio,
          precoVenda: precoVenda ? parseFloat(precoVenda) : null,
          precoAluguel: precoAluguel ? parseFloat(precoAluguel) : null,
          area: parseInt(area),
          quartos: parseInt(quartos),
          suites: suites ? parseInt(suites) : null,
          banheiros: parseInt(banheiros),
          vagas: vagas ? parseInt(vagas) : null,
          mobiliado,
          destaque,
          urlAmigavel,
          endereco: {
            update: formatarEndereco(endereco).create
          },
          imagens: {
            deleteMany: {},
            create: formatarImagens(imagens).create
          },
          caracteristicas: {
            deleteMany: {},
            create: formatarCaracteristicas(caracteristicas).create
          },
          ...(corretorId && { corretor: { connect: { id: corretorId } } })
        },
        include: {
          endereco: true,
          imagens: true,
          caracteristicas: {
            include: {
              caracteristica: true
            }
          },
          corretor: true
        }
      });

      res.json(imovel);
    } catch (erro) {
      console.error('Erro ao atualizar imóvel:', erro);
      res.status(500).json({ erro: 'Erro ao atualizar imóvel' });
    }
  },

  // Excluir imóvel (soft delete)
  async excluir(req, res) {
    try {
      const { id } = req.params;

      await prisma.imovel.update({
        where: { id },
        data: { deletadoEm: new Date() }
      });

      res.status(204).send();
    } catch (erro) {
      console.error('Erro ao excluir imóvel:', erro);
      res.status(500).json({ erro: 'Erro ao excluir imóvel' });
    }
  },

  // Listar características disponíveis
  async listarCaracteristicas(req, res) {
    try {
      const caracteristicas = await prisma.caracteristica.findMany({
        orderBy: { nome: 'asc' }
      });

      res.json(caracteristicas);
    } catch (erro) {
      console.error('Erro ao listar características:', erro);
      res.status(500).json({ erro: 'Erro ao listar características' });
    }
  },

  // Buscar histórico de preços
  async historicoPrecos(req, res) {
    try {
      const { id } = req.params;

      const historico = await prisma.historicoPreco.findMany({
        where: { imovelId: id },
        orderBy: { data: 'desc' }
      });

      res.json(historico);
    } catch (erro) {
      console.error('Erro ao buscar histórico de preços:', erro);
      res.status(500).json({ erro: 'Erro ao buscar histórico de preços' });
    }
  }
};

module.exports = imovelController;
