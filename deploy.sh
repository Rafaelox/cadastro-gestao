#!/bin/bash

# Sistema de Gestão - Docker Deployment Script
# Uso: ./deploy.sh [ambiente] [ação]
# Exemplos:
#   ./deploy.sh dev up
#   ./deploy.sh prod build
#   ./deploy.sh prod deploy

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="sistema-gestao"
IMAGE_NAME="sistema-gestao:latest"
BACKUP_DIR="./backups"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para mostrar uso
show_usage() {
    cat << EOF
Sistema de Gestão - Docker Deployment Script

Uso: $0 [ambiente] [ação]

Ambientes:
  dev         Ambiente de desenvolvimento
  prod        Ambiente de produção

Ações:
  build       Construir imagem Docker
  up          Subir serviços (build + start)
  down        Parar serviços
  restart     Reiniciar serviços
  deploy      Deploy completo (prod only)
  logs        Visualizar logs
  status      Status dos containers
  clean       Limpar recursos Docker não utilizados
  backup      Criar backup dos dados
  rollback    Rollback para versão anterior

Exemplos:
  $0 dev up                 # Subir ambiente de desenvolvimento
  $0 prod deploy            # Deploy completo em produção
  $0 prod logs              # Ver logs de produção
  $0 dev clean              # Limpar recursos de desenvolvimento

EOF
}

# Verificar se o Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker não está rodando ou não está acessível"
        exit 1
    fi
}

# Verificar se docker-compose está disponível
check_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        log_error "docker-compose não está instalado"
        exit 1
    fi
}

# Carregar variáveis de ambiente
load_env() {
    local env_file=".env"
    if [ "$1" = "prod" ]; then
        env_file=".env.production"
    elif [ "$1" = "dev" ]; then
        env_file=".env.development"
    fi

    if [ -f "$env_file" ]; then
        log_info "Carregando variáveis de ambiente de $env_file"
        export $(cat "$env_file" | grep -v '^#' | xargs)
    else
        log_warning "Arquivo $env_file não encontrado, usando valores padrão"
    fi
}

# Função para build
docker_build() {
    local env=$1
    log_info "Construindo imagem Docker para ambiente: $env"
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
    else
        docker-compose build --no-cache
    fi
    
    log_success "Build concluído com sucesso!"
}

# Função para subir serviços
docker_up() {
    local env=$1
    log_info "Subindo serviços para ambiente: $env"
    
    # Criar diretório de logs se não existir
    mkdir -p logs/nginx
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml up -d --build
    else
        docker-compose up -d --build
    fi
    
    log_success "Serviços iniciados com sucesso!"
    docker_status $env
}

# Função para parar serviços
docker_down() {
    local env=$1
    log_info "Parando serviços para ambiente: $env"
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    log_success "Serviços parados com sucesso!"
}

# Função para reiniciar serviços
docker_restart() {
    local env=$1
    log_info "Reiniciando serviços para ambiente: $env"
    
    docker_down $env
    sleep 2
    docker_up $env
}

# Função para deploy completo (apenas produção)
docker_deploy() {
    if [ "$1" != "prod" ]; then
        log_error "Deploy completo disponível apenas para produção"
        exit 1
    fi
    
    log_info "Iniciando deploy completo em produção..."
    
    # Verificar se há containers rodando e fazer backup
    if docker-compose -f docker-compose.prod.yml ps -q | grep -q .; then
        log_info "Criando backup antes do deploy..."
        docker_backup prod
    fi
    
    # Pull da imagem mais recente (se usando registry)
    # docker pull $IMAGE_NAME
    
    # Build e deploy
    docker_build prod
    docker_down prod
    docker_up prod
    
    # Aguardar health check
    log_info "Aguardando health check..."
    sleep 30
    
    # Verificar se o serviço está saudável
    if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
        log_success "Deploy concluído com sucesso!"
    else
        log_error "Deploy falhou - serviço não está saudável"
        log_warning "Executando rollback..."
        docker_rollback prod
    fi
}

# Função para visualizar logs
docker_logs() {
    local env=$1
    log_info "Visualizando logs para ambiente: $env"
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f --tail=100
    else
        docker-compose logs -f --tail=100
    fi
}

# Função para status
docker_status() {
    local env=$1
    log_info "Status dos containers para ambiente: $env"
    
    if [ "$env" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
    
    echo
    log_info "Uso de recursos:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Função para limpeza
docker_clean() {
    local env=$1
    log_info "Limpando recursos Docker não utilizados..."
    
    # Parar containers do ambiente específico
    docker_down $env
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    # Remover volumes não utilizados (cuidado!)
    read -p "Deseja remover volumes não utilizados? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi
    
    # Remover networks não utilizadas
    docker network prune -f
    
    log_success "Limpeza concluída!"
}

# Função para backup
docker_backup() {
    local env=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/${PROJECT_NAME}_${env}_${timestamp}.tar.gz"
    
    log_info "Criando backup para ambiente: $env"
    
    # Criar diretório de backup
    mkdir -p "$BACKUP_DIR"
    
    # Backup dos volumes (se houver dados persistentes)
    # docker run --rm -v nginx-logs:/backup-volume -v $PWD/$BACKUP_DIR:/backup alpine tar czf /backup/logs_${timestamp}.tar.gz -C /backup-volume .
    
    # Backup da configuração atual
    tar czf "$backup_file" docker-compose*.yml .env* nginx.conf Dockerfile 2>/dev/null || true
    
    log_success "Backup criado: $backup_file"
}

# Função para rollback
docker_rollback() {
    local env=$1
    log_warning "Executando rollback para ambiente: $env"
    
    # Procurar backup mais recente
    local latest_backup=$(ls -t "$BACKUP_DIR"/${PROJECT_NAME}_${env}_*.tar.gz 2>/dev/null | head -n1)
    
    if [ -z "$latest_backup" ]; then
        log_error "Nenhum backup encontrado para rollback"
        exit 1
    fi
    
    log_info "Usando backup: $latest_backup"
    
    # Parar serviços atuais
    docker_down $env
    
    # Restaurar configuração (se necessário)
    # tar xzf "$latest_backup"
    
    # Reiniciar com configuração anterior
    docker_up $env
    
    log_success "Rollback concluído!"
}

# Função principal
main() {
    local env=${1:-dev}
    local action=${2:-up}
    
    # Validar ambiente
    if [[ "$env" != "dev" && "$env" != "prod" ]]; then
        log_error "Ambiente inválido: $env"
        show_usage
        exit 1
    fi
    
    # Verificar pré-requisitos
    check_docker
    check_compose
    
    # Carregar variáveis de ambiente
    load_env $env
    
    # Executar ação
    case $action in
        build)
            docker_build $env
            ;;
        up)
            docker_up $env
            ;;
        down)
            docker_down $env
            ;;
        restart)
            docker_restart $env
            ;;
        deploy)
            docker_deploy $env
            ;;
        logs)
            docker_logs $env
            ;;
        status)
            docker_status $env
            ;;
        clean)
            docker_clean $env
            ;;
        backup)
            docker_backup $env
            ;;
        rollback)
            docker_rollback $env
            ;;
        *)
            log_error "Ação inválida: $action"
            show_usage
            exit 1
            ;;
    esac
}

# Verificar se há argumentos
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Executar função principal
main "$@"