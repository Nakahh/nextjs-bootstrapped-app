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
        MEDIA_DIR=\${config.paths.media}
        LOG_DIR=\${config.paths.logs}
        RETENTION_DAILY=\${config.retention.daily}
        RETENTION_WEEKLY=\${config.retention.weekly}
        COMPRESSION_RATIO=\${config.thresholds.compressionRatio}
        VALIDATE_CHECKSUM=\${config.security.validateChecksum}
        ENCRYPTION_ENABLED=\${config.security.encryption}
        ENCRYPTION_KEY=\${config.security.keyFile}
    \`);
")"

DATE=$(date +%Y%m%d_%H%M%S)

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro: $1${NC}"
        exit 1
    fi
}

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Este script precisa ser executado como root${NC}"
  exit 1
fi

# Cria diretório de backup se não existir
mkdir -p $BACKUP_DIR
check_error "Falha ao criar diretório de backup"

# Função para backup do banco de dados
backup_database() {
    echo -e "${YELLOW}Realizando backup do banco de dados...${NC}"
    
    # Carrega variáveis de ambiente
    if [ -f ../.env ]; then
        source ../.env
    else
        echo -e "${RED}Arquivo .env não encontrado${NC}"
        exit 1
    fi

    # Extrai informações da DATABASE_URL
    DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
    
    # Backup usando pg_dump
    PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c > "$BACKUP_DIR/db_backup_$DATE.dump"
    check_error "Falha ao realizar backup do banco de dados"
    
    echo -e "${GREEN}Backup do banco de dados concluído: $BACKUP_DIR/db_backup_$DATE.dump${NC}"
}

# Função para backup dos arquivos de mídia
backup_media() {
    echo -e "${YELLOW}Realizando backup dos arquivos de mídia...${NC}"
    
    if [ -d "$MEDIA_DIR" ]; then
        tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" -C "$MEDIA_DIR" .
        check_error "Falha ao realizar backup dos arquivos de mídia"
        echo -e "${GREEN}Backup dos arquivos de mídia concluído: $BACKUP_DIR/media_backup_$DATE.tar.gz${NC}"
    else
        echo -e "${YELLOW}Diretório de mídia não encontrado. Pulando backup de mídia.${NC}"
    fi
}

# Função para restaurar backup do banco de dados
restore_database() {
    echo -e "${YELLOW}Restaurando backup do banco de dados...${NC}"
    
    # Lista backups disponíveis
    echo -e "\nBackups disponíveis:"
    ls -1 $BACKUP_DIR/db_backup_*.dump 2>/dev/null
    
    # Solicita o arquivo de backup
    read -p "Digite o nome do arquivo de backup para restaurar: " BACKUP_FILE
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Arquivo de backup não encontrado${NC}"
        exit 1
    fi
    
    # Carrega variáveis de ambiente
    if [ -f ../.env ]; then
        source ../.env
    else
        echo -e "${RED}Arquivo .env não encontrado${NC}"
        exit 1
    fi
    
    # Restaura o banco
    PGPASSWORD=$DB_PASSWORD pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME --clean --no-owner "$BACKUP_FILE"
    check_error "Falha ao restaurar backup do banco de dados"
    
    echo -e "${GREEN}Restauração do banco de dados concluída${NC}"
}

# Função para restaurar backup de mídia
restore_media() {
    echo -e "${YELLOW}Restaurando backup dos arquivos de mídia...${NC}"
    
    # Lista backups disponíveis
    echo -e "\nBackups disponíveis:"
    ls -1 $BACKUP_DIR/media_backup_*.tar.gz 2>/dev/null
    
    # Solicita o arquivo de backup
    read -p "Digite o nome do arquivo de backup para restaurar: " BACKUP_FILE
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Arquivo de backup não encontrado${NC}"
        exit 1
    fi
    
    # Restaura os arquivos
    mkdir -p "$MEDIA_DIR"
    tar -xzf "$BACKUP_FILE" -C "$MEDIA_DIR"
    check_error "Falha ao restaurar backup dos arquivos de mídia"
    
    echo -e "${GREEN}Restauração dos arquivos de mídia concluída${NC}"
}

# Menu principal
echo -e "${YELLOW}Sistema de Backup - Siqueira Campos Imóveis${NC}"
echo "1. Realizar backup completo"
echo "2. Realizar backup apenas do banco de dados"
echo "3. Realizar backup apenas dos arquivos de mídia"
echo "4. Restaurar backup do banco de dados"
echo "5. Restaurar backup dos arquivos de mídia"
echo "6. Sair"

read -p "Escolha uma opção: " option

case $option in
    1)
        backup_database
        backup_media
        ;;
    2)
        backup_database
        ;;
    3)
        backup_media
        ;;
    4)
        restore_database
        ;;
    5)
        restore_media
        ;;
    6)
        echo -e "${GREEN}Saindo...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Operação concluída com sucesso!${NC}"
