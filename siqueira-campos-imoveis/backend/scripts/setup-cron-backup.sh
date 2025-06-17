#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Este script precisa ser executado como root${NC}"
  exit 1
fi

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro: $1${NC}"
        exit 1
    fi
}

# Obtém o caminho absoluto do diretório do projeto
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# Carrega configurações
CONFIG_FILE="./config/backup.config.js"
eval "$(node -e "
    const config = require('$CONFIG_FILE');
    console.log(\`
        BACKUP_DIR=\${config.paths.backup}
        LOG_DIR=\${config.paths.logs}
        DAILY_SCHEDULE='\${config.schedule.daily}'
        WEEKLY_SCHEDULE='\${config.schedule.weekly}'
        MONITOR_SCHEDULE='\${config.schedule.monitor}'
    \`);
")"

# Cria os diretórios necessários
mkdir -p "$BACKUP_DIR" "$LOG_DIR"
chown www-data:www-data "$BACKUP_DIR" "$LOG_DIR"
chmod 750 "$BACKUP_DIR" "$LOG_DIR"

# Configura cron jobs
CRONTAB_FILE="/etc/cron.d/siqueira-campos-backup"
cat > "$CRONTAB_FILE" << EOL
# Backup diário do banco de dados
$DAILY_SCHEDULE www-data cd ${PROJECT_DIR} && npm run backup:db >> $LOG_DIR/backup.log 2>&1

# Backup semanal completo
$WEEKLY_SCHEDULE www-data cd ${PROJECT_DIR} && npm run backup >> $LOG_DIR/backup.log 2>&1

# Monitoramento do sistema de backup
$MONITOR_SCHEDULE www-data cd ${PROJECT_DIR} && npm run monitor:backup >> $LOG_DIR/monitor.log 2>&1
EOL

chmod 644 "$CRONTAB_FILE"
check_error "Falha ao configurar cron jobs"

# Configura rotação de logs
cat > "/etc/logrotate.d/siqueira-campos-backup" << EOL
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
EOL
check_error "Falha ao configurar rotação de logs"

echo -e "${GREEN}Configuração de backup automático concluída:${NC}"
echo "- Backup do banco de dados: $DAILY_SCHEDULE"
echo "- Backup completo: $WEEKLY_SCHEDULE"
echo "- Monitoramento: $MONITOR_SCHEDULE"
echo "- Rotação de logs: configurada"
echo -e "\n${YELLOW}Logs serão salvos em $LOG_DIR/${NC}"
