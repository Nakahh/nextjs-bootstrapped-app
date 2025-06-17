#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando deploy do sistema Siqueira Campos Imóveis...${NC}\n"

# Verifica se o script está sendo executado como root
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

# Instala dependências necessárias
echo -e "${YELLOW}Instalando dependências...${NC}"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx
check_error "Falha ao instalar dependências"

# Copia configuração do Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
cp nginx/nginx.conf /etc/nginx/nginx.conf
check_error "Falha ao copiar configuração do Nginx"

# Cria diretório para logs
mkdir -p /var/log/siqueira-campos-imoveis
check_error "Falha ao criar diretório de logs"

# Configura permissões dos logs
chown -R www-data:www-data /var/log/siqueira-campos-imoveis
chmod 755 /var/log/siqueira-campos-imoveis

# Instala dependências do Node.js
echo -e "${YELLOW}Instalando dependências do Node.js...${NC}"
npm install
check_error "Falha ao instalar dependências do Node.js"

# Cria arquivo .env a partir do exemplo se não existir
if [ ! -f .env ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cp .env.example .env
    check_error "Falha ao criar arquivo .env"
fi

# Configura PM2 para gerenciar os processos
echo -e "${YELLOW}Configurando PM2...${NC}"
npm install -g pm2
check_error "Falha ao instalar PM2"

# Inicia os servidores com PM2
echo -e "${YELLOW}Iniciando servidores...${NC}"
pm2 start start-servers.js --name "siqueira-campos-imoveis"
check_error "Falha ao iniciar servidores"

# Configura PM2 para iniciar no boot
pm2 startup
pm2 save
check_error "Falha ao configurar PM2 para iniciar no boot"

# Obtém certificados SSL
echo -e "${YELLOW}Obtendo certificados SSL...${NC}"
certbot --nginx -d siqueiracamposimoveis.com.br -d www.siqueiracamposimoveis.com.br -d admin.siqueiracamposimoveis.com.br -d app.siqueiracamposimoveis.com.br --agree-tos --email dev@siqueiracamposimoveis.com.br --redirect
check_error "Falha ao obter certificados SSL"

# Reinicia Nginx
echo -e "${YELLOW}Reiniciando Nginx...${NC}"
systemctl restart nginx
check_error "Falha ao reiniciar Nginx"

# Cria usuário e senha para área administrativa
echo -e "${YELLOW}Configurando autenticação para área administrativa...${NC}"
if [ ! -f /etc/nginx/.htpasswd ]; then
    echo -e "${GREEN}Digite o usuário para acesso administrativo:${NC}"
    read admin_user
    htpasswd -c /etc/nginx/.htpasswd $admin_user
    check_error "Falha ao criar arquivo de senhas"
fi

echo -e "${GREEN}Deploy concluído com sucesso!${NC}"
echo -e "\nServidores disponíveis em:"
echo -e "- https://siqueiracamposimoveis.com.br"
echo -e "- https://admin.siqueiracamposimoveis.com.br"
echo -e "- https://app.siqueiracamposimoveis.com.br"

# Exibe status dos serviços
echo -e "\n${YELLOW}Status dos serviços:${NC}"
pm2 list
systemctl status nginx | grep "Active:"
