const express = require('express');
const clientApp = express();

// Middleware específico para o app cliente
clientApp.use(express.json());
clientApp.use(express.urlencoded({ extended: true }));

// Rotas específicas do cliente
clientApp.use('/api/auth', require('./routes/authRoutes'));
clientApp.use('/api/imoveis', require('./routes/imovelRoutes'));
clientApp.use('/api/favoritos', require('./routes/favoritoRoutes'));
clientApp.use('/api/clientes', require('./routes/clienteRoutes'));
clientApp.use('/api/artigos', require('./routes/artigoRoutes'));
clientApp.use('/api/comunicacao', require('./routes/comunicacaoRoutes'));

// Rota de verificação do app cliente
clientApp.get('/health', (req, res) => {
  res.json({ status: 'Client app is running' });
});

module.exports = clientApp;
