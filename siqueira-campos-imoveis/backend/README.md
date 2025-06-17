## Sistema de Backup

O sistema possui um mecanismo robusto de backup e monitoramento, configurável através do arquivo `config/backup.config.js`.

### Configuração Inicial

1. Edite as configurações em `config/backup.config.js`:
   ```javascript
   module.exports = {
     paths: {
       backup: '/var/backups/siqueira-campos-imoveis',
       logs: '/var/log/siqueira-campos-imoveis',
       media: '../uploads'
     },
     notifications: {
       email: {
         enabled: true,
         address: 'seu-email@exemplo.com'
       },
       slack: {
         enabled: false,
         webhook: 'sua-url-webhook'
       }
     }
     // ... outras configurações
   }
   ```

2. Execute o script de configuração:
   ```bash
   sudo ./scripts/setup-cron-backup.sh
   ```

### Estrutura de Backups

```
/var/backups/siqueira-campos-imoveis/
├── db_backup_YYYYMMDD_HHMMSS.dump     # Backups do banco
└── media_backup_YYYYMMDD_HHMMSS.tar.gz # Backups de mídia
```

### Agendamento

- **Backup Diário**: Banco de dados (1h da manhã)
- **Backup Semanal**: Completo - DB + mídia (2h da manhã de domingo)
- **Monitoramento**: A cada 6 horas

### Políticas de Retenção

- **Backups Diários**: Últimos 7 dias
- **Backups Semanais**: Últimas 4 semanas
- **Logs**: 14 dias (com compressão)

### Monitoramento

O sistema monitora automaticamente:
- Integridade dos backups
- Idade dos arquivos
- Espaço em disco
- Razão de compressão
- Logs de erro

### Notificações

Alertas são enviados quando:
- Backup não foi realizado nas últimas 26 horas
- Uso do disco ultrapassa 80%
- Erros são encontrados nos logs
- Arquivos de backup estão corrompidos
- Razão de compressão está abaixo do esperado

### Logs

```
/var/log/siqueira-campos-imoveis/
├── backup.log    # Operações de backup
├── restore.log   # Operações de restauração
└── monitor.log   # Logs de monitoramento
```

### Scripts Disponíveis

```bash
# Execução manual
npm run backup      # Backup completo
npm run backup:db   # Apenas banco de dados
npm run backup:media # Apenas arquivos de mídia

# Restauração
npm run restore:db   # Restaura banco de dados
npm run restore:media # Restaura arquivos de mídia

# Monitoramento
npm run monitor:backup # Executa verificações
```

### Procedimentos de Emergência

1. Em caso de falha no backup:
   ```bash
   # Verifique os logs
   tail -f /var/log/siqueira-campos-imoveis/backup.log
   
   # Execute backup manual
   npm run backup
   ```

2. Para restaurar backup:
   ```bash
   # Liste backups disponíveis
   ls -l /var/backups/siqueira-campos-imoveis/
   
   # Restaure usando npm scripts
   npm run restore:db
   npm run restore:media
   ```

### Boas Práticas

1. **Monitoramento**:
   - Verifique os logs diariamente
   - Configure alertas por email/Slack
   - Mantenha contato de emergência atualizado

2. **Manutenção**:
   - Teste restaurações periodicamente
   - Verifique integridade dos backups
   - Monitore espaço em disco
   - Mantenha cópias offsite

3. **Documentação**:
   - Mantenha procedimentos atualizados
   - Documente todas as restaurações
   - Registre alterações na configuração

4. **Segurança**:
   - Restrinja acesso aos backups
   - Use conexões seguras para backups remotos
   - Mantenha logs de acesso

## Segurança

- Cada subdomínio possui suas próprias configurações de CORS
