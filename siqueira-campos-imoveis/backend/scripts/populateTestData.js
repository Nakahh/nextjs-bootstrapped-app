const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  // Senha padrão para todos os usuários de teste
  const defaultPassword = 'Senha123!';

  // Mapear papéis para enum do Prisma
  const papelEnum = {
    ADMIN: 'ADMIN',
    CORRETOR: 'CORRETOR',
    ASSISTENTE: 'ASSISTENTE',
    CLIENTE: 'CLIENTE',
  };

  // Criação dos usuários Juarez com diferentes papéis
  const usersData = [
    { nome: 'juarezadmin', email: 'juarezadmin@example.com', papel: papelEnum.ADMIN },
    { nome: 'juarezcorretor', email: 'juarezcorretor@example.com', papel: papelEnum.CORRETOR },
    { nome: 'juarezassistente', email: 'juarezassistente@example.com', papel: papelEnum.ASSISTENTE },
    { nome: 'juarezcliente', email: 'juarezcliente@example.com', papel: papelEnum.CLIENTE },
  ];

  for (const userData of usersData) {
    const existingUser = await prisma.usuario.findUnique({ where: { email: userData.email } });
    if (!existingUser) {
      const senhaHash = await bcrypt.hash(defaultPassword, 10);
      await prisma.usuario.create({
        data: {
          nome: userData.nome,
          email: userData.email,
          senha: senhaHash,
          papel: userData.papel,
        },
      });
      console.log(`Usuário ${userData.nome} criado com senha: ${defaultPassword}`);
    } else {
      console.log(`Usuário ${userData.nome} já existe.`);
    }
  }

  // Criar tipos de imóveis de teste com fotos (se não existirem)
  const tiposImoveis = [
    { nome: 'Apartamento', fotoUrl: 'https://example.com/fotos/apartamento.jpg' },
    { nome: 'Casa', fotoUrl: 'https://example.com/fotos/casa.jpg' },
    { nome: 'Terreno', fotoUrl: 'https://example.com/fotos/terreno.jpg' },
  ];

  for (const tipo of tiposImoveis) {
    const existingTipo = await prisma.tipoImovel.findUnique({ where: { nome: tipo.nome } });
    if (!existingTipo) {
      await prisma.tipoImovel.create({
        data: {
          nome: tipo.nome,
          fotoUrl: tipo.fotoUrl,
        },
      });
      console.log(`Tipo de imóvel ${tipo.nome} criado.`);
    } else {
      console.log(`Tipo de imóvel ${tipo.nome} já existe.`);
    }
  }

  // Criar cliente de teste
  const clienteEmail = 'cliente.teste@example.com';
  let cliente;
  try {
    cliente = await prisma.cliente.findUnique({ where: { email: clienteEmail } });
  } catch (error) {
    console.log('Erro ao buscar cliente:', error.message);
  }
  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nome: 'Cliente Teste',
        email: clienteEmail,
        telefone: '123456789',
      },
    });
    console.log('Cliente de teste criado.');
  } else {
    console.log('Cliente de teste já existe.');
  }

  // Criar simulações de conversas (comunicações)
  const conversas = [
    {
      clienteId: cliente.id,
      mensagem: 'Olá, gostaria de saber mais sobre o apartamento disponível.',
      tipo: 'cliente',
    },
    {
      clienteId: cliente.id,
      mensagem: 'Claro, o apartamento tem 3 quartos e está disponível para visita.',
      tipo: 'corretor',
    },
  ];

  for (const conversa of conversas) {
    await prisma.comunicacao.create({
      data: {
        clienteId: conversa.clienteId,
        mensagem: conversa.mensagem,
        tipo: conversa.tipo,
        data: new Date(),
      },
    });
  }
  console.log('Simulações de conversas criadas.');

  console.log('População de dados de teste concluída.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
