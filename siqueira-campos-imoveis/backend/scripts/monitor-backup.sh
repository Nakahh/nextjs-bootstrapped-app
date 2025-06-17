#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Carrega configurações
CONFIG_FILE="../config/backup.config.js"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Arquivo de configuração não encontrado: $CONFIG_FILE${NC}"
    exit 1
fi

# Extrai configurações usando node
eval "$(node -e "
    const config = require('$CONFIG_FILE');
    console.log(\`
        BACKUP_DIR=\${config.paths.backup}
        LOG_DIR=\${config.paths.logs}
        EMAIL=\${config.notifications.email.enabled ? config.notifications.email.address : ''}
        DISK_THRESHOLD=\${config.thresholds.diskUsage}
        MAX_BACKUP_AGE=\${config.thresholds.backupAge}
        SLACK_WEBHOOK_URL=\${config.notifications.slack.enabled ? config.notifications.slack.webhook : ''}
        SLACK_CHANNEL=\${config.notifications.slack.channel}
        SLACK_USERNAME=\${config.notifications.slack.username}
        VALIDATE_CHECKSUM=\${config.security.validateChecksum}
        COMPRESSION_RATIO=\${config.thresholds.compressionRatio}
    \`);
")"

# Função para enviar notificações
send_notification() {
    local subject="$1"
    local message="$2"
    local level="$3"  # info, warning, error
    
    # Envia email se configurado
    if [ -n "$EMAIL" ]; then
        echo "$message" | mail -s "[Backup Monitor] $subject" "$EMAIL"
    fi
    
    # Envia para Slack se configurado
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        if [ "$level" == "warning" ]; then
            color="warning"
        elif [ "$level" == "error" ]; then
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' --data "{
            \"channel\": \"$SLACK_CHANNEL\",
            \"username\": \"$SLACK_USERNAME\",
            \"attachments\": [
                {
                    \"color\": \"$color\",
                    \"title\": \"$subject\",
                    \"text\": \"$message\",
                    \"footer\": \"Siqueira Campos Imóveis - Backup Monitor\"
                }
            ]
        }" "$SLACK_WEBHOOK_URL"
    fi
}

# Verifica espaço em disco
check_disk_space() {
    local disk_usage=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_notification \
            "Alerta de Espaço em Disco" \
            "O diretório de backup está com ${disk_usage}% de uso, acima do limite de ${DISK_THRESHOLD}%" \
            "warning"
    fi
}

# Verifica idade dos backups
check_backup_age() {
    local latest_backup=$(ls -t "$BACKUP_DIR"/db_backup_*.dump 2>/dev/null | head -n1)
    if [ -z "$latest_backup" ]; then
        send_notification \
            "Erro: Backup Não Encontrado" \
            "Nenhum backup do banco de dados foi encontrado no diretório $BACKUP_DIR" \
            "error"
        return
    fi
    
    local backup_age=$(( ( $(date +%s) - $(stat -c %Y "$latest_backup") ) / 3600 ))
    if [ "$backup_age" -gt "$MAX_BACKUP_AGE" ]; then
        send_notification \
            "Alerta: Backup Desatualizado" \
            "O último backup tem $backup_age horas (máximo permitido: $MAX_BACKUP_AGE horas)" \
            "warning"
    fi
}

# Verifica integridade dos backups
check_backup_integrity() {
    if [ "$VALIDATE_CHECKSUM" != "true" ]; then
        return
    fi

    local latest_backup=$(ls -t "$BACKUP_DIR"/db_backup_*.dump 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        if ! pg_restore --list "$latest_backup" >/dev/null 2>&1; then
            send_notification \
                "Erro: Backup Corrompido" \
                "O último backup do banco de dados está corrompido: $latest_backup" \
                "error"
        fi
    fi
    
    local latest_media=$(ls -t "$BACKUP_DIR"/media_backup_*.tar.gz 2>/dev/null | head -n1)
    if [ -n "$latest_media" ]; then
        if ! tar -tzf "$latest_media" >/dev/null 2>&1; then
            send_notification \
                "Erro: Backup de Mídia Corrompido" \
                "O último backup de mídia está corrompido: $latest_media" \
                "error"
        fi
    fi
}

# Verifica razão de compressão
check_compression_ratio() {
    local latest_media=$(ls -t "$BACKUP_DIR"/media_backup_*.tar.gz 2>/dev/null | head -n1)
    if [ -n "$latest_media" ]; then
        local original_size=$(tar -tvf "$latest_media" | awk '{sum += $3} END {print sum}')
        local compressed_size=$(stat -c %s "$latest_media")
        local ratio=$(echo "scale=2; $compressed_size / $original_size" | bc)
        
        if (( $(echo "$ratio > $COMPRESSION_RATIO" | bc -l) )); then
            send_notification \
                "Alerta: Compressão Ineficiente" \
                "Razão de compressão ($ratio) está acima do limite ($COMPRESSION_RATIO)" \
                "warning"
        fi
    fi
}

# Verifica logs de erro
check_error_logs() {
    if [ -f "$LOG_DIR/backup.log" ]; then
        local errors=$(grep -i "erro\|falha\|error\|failed" "$LOG_DIR/backup.log" | tail -n 5)
        if [ -n "$errors" ]; then
            send_notification \
                "Erros Encontrados nos Logs" \
                "Últimos erros encontrados:\n\n$errors" \
                "warning"
        fi
    fi
}

# Executa todas as verificações
echo -e "${YELLOW}Iniciando verificação do sistema de backup...${NC}"

check_disk_space
check_backup_age
check_backup_integrity
check_compression_ratio
check_error_logs

echo -e "${GREEN}Verificação concluída${NC}"
