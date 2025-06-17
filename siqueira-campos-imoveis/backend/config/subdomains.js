const subdomains = {
  admin: {
    domain: 'admin.siqueiracamposimoveis.com.br',
    port: process.env.ADMIN_PORT || 3001,
    description: 'Painel Administrativo'
  },
  app: {
    domain: 'app.siqueiracamposimoveis.com.br',
    port: process.env.APP_PORT || 3002,
    description: 'Aplicativo Cliente'
  },
  main: {
    domain: 'siqueiracamposimoveis.com.br',
    port: process.env.PORT || 3000,
    description: 'Site Principal'
  }
};

module.exports = subdomains;
