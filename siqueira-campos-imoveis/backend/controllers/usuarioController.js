const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nome, username, senha, papel } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, username, senha: senhaHash, papel }
    });
    res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { username } });
    if (!usuario) return res.status(400).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario.id, papel: usuario.papel }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, username: usuario.username, papel: usuario.papel } });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        senha: true,
        papel: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};
