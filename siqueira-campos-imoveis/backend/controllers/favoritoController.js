const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addFavorito = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { imovelId } = req.body;

    const favoritoExistente = await prisma.favorito.findFirst({
      where: { usuarioId, imovelId }
    });
    if (favoritoExistente) return res.status(400).json({ error: 'Imóvel já favoritado' });

    const favorito = await prisma.favorito.create({
      data: { usuarioId, imovelId }
    });
    res.status(201).json(favorito);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao favoritar imóvel' });
  }
};

exports.removeFavorito = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const id = parseInt(req.params.id);

    const favorito = await prisma.favorito.findUnique({ where: { id } });
    if (!favorito || favorito.usuarioId !== usuarioId) return res.status(404).json({ error: 'Favorito não encontrado' });

    await prisma.favorito.delete({ where: { id } });
    res.json({ message: 'Favorito removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
};
