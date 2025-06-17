module.exports = {
  // Diretórios
  paths: {
    backup: '/var/backups/siqueira-campos-imoveis',
    logs: '/var/log/siqueira-campos-imoveis',
    media: '../uploads'
  },

  // Configurações de retenção
  retention: {
    daily: 7,    // Dias para manter backups diários
    weekly: 4,   // Semanas para manter backups semanais
    logs: 14     // Dias para manter logs
  },

  // Limites e alertas
  thresholds: {
    diskUsage: 80,         // Porcentagem máxima de uso do disco
    backupAge: 26,         // Idade máxima em horas para backups
    compressionRatio: 0.5  // Razão mínima de compressão esperada
  },

  // Notificações
  notifications: {
    email: {
      enabled: true,
      address: 'admin@siqueiracamposimoveis.com.br',
      critical: true  // Enviar apenas alertas críticos
    },
    slack: {
      enabled: false,
      webhook: '',
      channel: '#backups',
      username: 'Backup Monitor'
    }
  },

  // Configurações do banco de dados
  database: {
    type: 'postgresql',
    compression: true,
    validateRestore: true
  },

  // Configurações de segurança
  security: {
    encryption: false,     // Habilitar criptografia dos backups
    keyFile: '',          // Caminho para chave de criptografia
    validateChecksum: true // Validar checksum após backup
  },

  // Agendamento
  schedule: {
    daily: '0 1 * * *',     // 1h da manhã
    weekly: '0 2 * * 0',    // 2h da manhã de domingo
    monitor: '0 */6 * * *'  // A cada 6 horas
  }
};
