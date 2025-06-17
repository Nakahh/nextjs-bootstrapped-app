const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createVisita = async (req, res) => {
  try {
    const { imovelId, clienteId, data, status } = req.body;
    const visita = await prisma.visita.create({
      data: {
        imovelId: parseInt(imovelId),
        clienteId: parseInt(clienteId),
        data: new Date(data),
        status: status || 'Agendada',
      },
    });
    res.status(201).json(visita);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento de visita' });
  }
};

exports.listVisitas = async (req, res) => {
  try {
    const visitas = await prisma.visita.findMany({
      include: {
        imovel: true,
        cliente: true,
      },
    });
    res.json(visitas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar visitas' });
  }
};

exports.updateVisitaStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const visita = await prisma.visita.update({
      where: { id },
      data: { status },
    });
    res.json(visita);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status da visita' });
  }
};
