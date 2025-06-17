#!/usr/bin/env node
const { spawn } = require('child_process');
const subdomains = require('./config/subdomains');

const servers = [
  {
    name: 'Admin',
    command: 'node',
    args: ['admin-server.js'],
    port: subdomains.admin.port
  },
  {
    name: 'App Cliente',
    command: 'node',
    args: ['app-server.js'],
    port: subdomains.app.port
  },
  {
    name: 'Principal',
    command: 'node',
    args: ['server.js'],
    port: subdomains.main.port
  }
];

const startServer = (server) => {
  console.log(`Iniciando servidor ${server.name} na porta ${server.port}...`);
  
  const process = spawn(server.command, server.args, {
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`Erro ao iniciar servidor ${server.name}:`, error);
  });

  return process;
};

// Inicia todos os servidores
console.log('Iniciando servidores...\n');
const processes = servers.map(startServer);

// Gerenciamento de encerramento
const cleanup = () => {
  console.log('\nEncerrando servidores...');
  processes.forEach((process) => {
    process.kill();
  });
  process.exit(0);
};

// Captura sinais de encerramento
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
