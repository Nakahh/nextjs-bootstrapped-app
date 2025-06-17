const express = require('express');
const adminApp = express();

// Middleware específico para o painel admin
adminApp.use(express.json());
adminApp.use(express.urlencoded({ extended: true }));

// Rotas específicas do admin
adminApp.use('/api/admin', require('./routes/adminRoutes'));
adminApp.use('/api/financeiro', require('./routes/financeiroRoutes'));
adminApp.use('/api/visitas', require('./routes/visitaRoutes'));

// Rota de verificação do painel admin
adminApp.get('/health', (req, res) => {
  res.json({ status: 'Admin panel is running' });
});

module.exports = adminApp;
