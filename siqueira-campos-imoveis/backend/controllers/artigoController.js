const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const prisma = new PrismaClient();

// Função auxiliar para gerar URL amigável única
async function gerarUrlAmigavel(titulo, id = null) {
  let urlAmigavel = slugify(titulo, {
    lower: true,
    strict: true,
    locale: 'pt'
  });

  const artigoExistente = await prisma.artigo.findFirst({
    where: {
      urlAmigavel,
      NOT: id ? { id } : undefined
    }
  });

  if (artigoExistente) {
    // Se já existe um artigo com essa URL, adiciona um número no final
    const artigos = await prisma.artigo.findMany({
      where: {
        urlAmigavel: {
          startsWith: urlAmigavel
        }
      }
    });
    urlAmigavel = `${urlAmigavel}-${artigos.length + 1}`;
  }

  return urlAmigavel;
}

exports.listarArtigos = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 9,
      categoria,
      busca,
      ordem = 'recentes'
    } = req.query;

    const admin = req.query.admin === 'true';

    // Construir where clause
    const where = {
      publicado: admin ? undefined : true,
      ...(categoria && {
        categorias: {
          some: {
            nome: categoria
          }
        }
      }),
      ...(busca && {
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' } },
          { conteudo: { contains: busca, mode: 'insensitive' } }
        ]
      })
    };

    // Construir orderBy
    const orderBy = {
      ...(ordem === 'antigos' && { criadoEm: 'asc' }),
      ...(ordem === 'recentes' && { criadoEm: 'desc' }),
      ...(ordem === 'populares' && { visualizacoes: 'desc' })
    };

    // Buscar total de artigos para paginação
    const total = await prisma.artigo.count({ where });
    const paginas = Math.ceil(total / limite);

    // Buscar artigos com paginação
    const artigos = await prisma.artigo.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * limite,
      take: parseInt(limite),
      include: {
        categorias: true
      }
    });

    res.json({ artigos, paginas, total });
  } catch (erro) {
    console.error('Erro ao listar artigos:', erro);
    res.status(500).json({ erro: 'Erro ao listar artigos' });
  }
};

exports.buscarArtigo = async (req, res) => {
  try {
    const { urlAmigavel } = req.params;

    const artigo = await prisma.artigo.findUnique({
      where: { urlAmigavel },
      include: {
        categorias: true,
        // Buscar artigos relacionados da mesma categoria
        categorias: {
          include: {
            artigos: {
              where: {
                NOT: { urlAmigavel },
                publicado: true
              },
              take: 3,
              include: {
                categorias: true
              }
            }
          }
        }
      }
    });

    if (!artigo) {
      return res.status(404).json({ erro: 'Artigo não encontrado' });
    }

    // Incrementar visualizações
    await prisma.artigo.update({
      where: { id: artigo.id },
      data: {
        visualizacoes: {
          increment: 1
        }
      }
    });

    // Formatar artigos relacionados
    const artigosRelacionados = artigo.categorias
      .flatMap(c => c.artigos)
      .filter((a, i, self) => 
        i === self.findIndex(t => t.id === a.id)
      );

    // Remover artigos das categorias antes de enviar
    artigo.categorias = artigo.categorias.map(({ artigos, ...c }) => c);
    artigo.artigosRelacionados = artigosRelacionados;

    res.json(artigo);
  } catch (erro) {
    console.error('Erro ao buscar artigo:', erro);
    res.status(500).json({ erro: 'Erro ao buscar artigo' });
  }
};

exports.criarArtigo = async (req, res) => {
  try {
    const { titulo, conteudo, categorias, metaTitle, metaDescription, publicado } = req.body;

    const urlAmigavel = await gerarUrlAmigavel(titulo);

    const artigo = await prisma.artigo.create({
      data: {
        titulo,
        conteudo,
        urlAmigavel,
        metaTitle,
        metaDescription,
        publicado: !!publicado,
        categorias: {
          connectOrCreate: categorias.map(categoria => ({
            where: { nome: categoria.nome },
            create: { nome: categoria.nome }
          }))
        }
      },
      include: {
        categorias: true
      }
    });

    res.status(201).json(artigo);
  } catch (erro) {
    console.error('Erro ao criar artigo:', erro);
    res.status(500).json({ erro: 'Erro ao criar artigo' });
  }
};

exports.atualizarArtigo = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, categorias, metaTitle, metaDescription, publicado } = req.body;

    const urlAmigavel = await gerarUrlAmigavel(titulo, parseInt(id));

    // Primeiro, desconectar todas as categorias existentes
    await prisma.artigo.update({
      where: { id: parseInt(id) },
      data: {
        categorias: {
          set: []
        }
      }
    });

    // Depois, atualizar o artigo com as novas categorias
    const artigo = await prisma.artigo.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        conteudo,
        urlAmigavel,
        metaTitle,
        metaDescription,
        publicado: !!publicado,
        categorias: {
          connectOrCreate: categorias.map(categoria => ({
            where: { nome: categoria.nome },
            create: { nome: categoria.nome }
          }))
        }
      },
      include: {
        categorias: true
      }
    });

    res.json(artigo);
  } catch (erro) {
    console.error('Erro ao atualizar artigo:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar artigo' });
  }
};

exports.excluirArtigo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.artigo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensagem: 'Artigo excluído com sucesso' });
  } catch (erro) {
    console.error('Erro ao excluir artigo:', erro);
    res.status(500).json({ erro: 'Erro ao excluir artigo' });
  }
};

exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            artigos: {
              where: {
                publicado: true
              }
            }
          }
        }
      }
    });

    res.json(categorias);
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro);
    res.status(500).json({ erro: 'Erro ao listar categorias' });
  }
};
