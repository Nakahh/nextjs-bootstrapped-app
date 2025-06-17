const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listFinanceiro = async (req, res) => {
  try {
    const registros = await prisma.financeiro.findMany();
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar registros financeiros' });
  }
};

exports.createFinanceiro = async (req, res) => {
  try {
    const { tipo, descricao, valor, data, imovelId, clienteId } = req.body;
    const registro = await prisma.financeiro.create({
      data: {
        tipo,
        descricao,
        valor: parseFloat(valor),
        data: new Date(data),
        imovelId: imovelId ? parseInt(imovelId) : null,
        clienteId: clienteId ? parseInt(clienteId) : null,
      },
    });
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar registro financeiro' });
  }
};
