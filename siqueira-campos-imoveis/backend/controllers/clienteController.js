const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCliente = async (req, res) => {
  try {
    const data = req.body;
    const cliente = await prisma.cliente.create({ data });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

exports.listClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        contatos: true,
        tags: true,
      },
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        contatos: true,
        tags: true,
      },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const cliente = await prisma.cliente.update({ where: { id }, data });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.cliente.delete({ where: { id } });
    res.json({ message: 'Cliente removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
};

// Novo endpoint para adicionar contato ao cliente
exports.addContato = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const { tipo, descricao } = req.body;
    const contato = await prisma.contatoCliente.create({
      data: {
        clienteId,
        tipo,
        descricao,
      },
    });
    res.status(201).json(contato);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar contato' });
  }
};

// Novo endpoint para listar contatos de um cliente
exports.listContatos = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const contatos = await prisma.contatoCliente.findMany({
      where: { clienteId },
      orderBy: { data: 'desc' },
    });
    res.json(contatos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar contatos' });
  }
};

// Novo endpoint para adicionar tag a um cliente (segmentação)
exports.addTag = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const { nome } = req.body;
    const tag = await prisma.tagCliente.create({
      data: {
        clienteId,
        nome,
      },
    });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar tag' });
  }
};

// Novo endpoint para listar tags de um cliente
exports.listTags = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const tags = await prisma.tagCliente.findMany({
      where: { clienteId },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar tags' });
  }
};
