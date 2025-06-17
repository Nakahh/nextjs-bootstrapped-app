#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando ambiente de desenvolvimento local...${NC}\n"

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

# Adiciona entradas no /etc/hosts
echo -e "${YELLOW}Configurando /etc/hosts...${NC}"
HOSTS_ENTRIES="
# Siqueira Campos Imóveis - Ambiente de desenvolvimento
127.0.0.1 siqueiracamposimoveis.com.br
127.0.0.1 admin.siqueiracamposimoveis.com.br
127.0.0.1 app.siqueiracamposimoveis.com.br"

if ! grep -q "siqueiracamposimoveis.com.br" /etc/hosts; then
    echo "$HOSTS_ENTRIES" >> /etc/hosts
    check_error "Falha ao adicionar entradas no /etc/hosts"
    echo -e "${GREEN}Entradas adicionadas ao /etc/hosts${NC}"
else
    echo -e "${YELLOW}Entradas já existem no /etc/hosts${NC}"
fi

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cp .env.example .env
    check_error "Falha ao criar arquivo .env"
fi

# Instala dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install
check_error "Falha ao instalar dependências"

# Executa as migrações do banco de dados
echo -e "${YELLOW}Executando migrações do banco de dados...${NC}"
npm run migrate
check_error "Falha ao executar migrações"

# Popula o banco com dados de teste
echo -e "${YELLOW}Populando banco de dados com dados de teste...${NC}"
npm run seed
check_error "Falha ao popular banco de dados"

echo -e "\n${GREEN}Ambiente de desenvolvimento configurado com sucesso!${NC}"
echo -e "\nPara iniciar os servidores em modo desenvolvimento, execute:"
echo -e "npm run dev"
echo -e "\nServidores disponíveis em:"
echo -e "- http://siqueiracamposimoveis.com.br:3000"
echo -e "- http://admin.siqueiracamposimoveis.com.br:3001"
echo -e "- http://app.siqueiracamposimoveis.com.br:3002"

# Pergunta se deseja iniciar os servidores
read -p "Deseja iniciar os servidores agora? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Iniciando servidores...${NC}"
    # Volta para o usuário normal para executar o npm
    su - $SUDO_USER -c "cd $(pwd) && npm run dev"
fi
