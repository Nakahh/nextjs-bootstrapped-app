const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { username, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { username } });
    if (!usuario) return res.status(401).json({ error: 'Credenciais inválidas' });

    const validPassword = await bcrypt.compare(senha, usuario.senha);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    // Verifica se o usuário tem papel administrativo
    if (!['admin', 'corretor', 'assistente'].includes(usuario.papel)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, papel: usuario.papel },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao autenticar usuário' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Estatísticas básicas
    const vendas = await prisma.venda.count();
    const ligacoes = await prisma.ligacao.count();
    const visitas = await prisma.visita.count();

    // Estatísticas financeiras
    const receitaTotal = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: { tipo: 'Receita' },
    });
    const despesaTotal = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: { tipo: 'Despesa' },
    });

    // Metas e conversões (exemplo simples)
    const metaVendas = 100; // Meta mensal de vendas
    const vendasMes = await prisma.venda.count({
      where: {
        data: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
    const conversao = vendasMes / metaVendas;

    res.json({
      vendas,
      ligacoes,
      visitas,
      receitaTotal: receitaTotal._sum.valor || 0,
      despesaTotal: despesaTotal._sum.valor || 0,
      metaVendas,
      vendasMes,
      conversao,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};
