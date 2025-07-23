#!/bin/bash

# ================================================
# SCRIPT DE BACKUP E RESTORE - PostgreSQL VPS
# ================================================

# Configurações (ajuste conforme seu ambiente)
DB_NAME="sistema_gestao"
DB_USER="gestao_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/opt/backups"
APP_DIR="/opt/sistema-gestao"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ================================================
# FUNÇÃO DE BACKUP
# ================================================

backup_database() {
    local backup_name="$1"
    local backup_type="${2:-full}"
    
    if [ -z "$backup_name" ]; then
        backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    fi
    
    local backup_file="$BACKUP_DIR/database/${backup_name}.sql"
    
    print_status "Iniciando backup do banco de dados..."
    
    # Criar diretório se não existir
    mkdir -p "$BACKUP_DIR/database"
    
    # Fazer backup
    if [ "$backup_type" = "schema" ]; then
        print_status "Fazendo backup apenas do schema..."
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --schema-only \
            --no-owner \
            --no-privileges > "$backup_file"
    else
        print_status "Fazendo backup completo (schema + dados)..."
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --no-owner \
            --no-privileges > "$backup_file"
    fi
    
    if [ $? -eq 0 ]; then
        # Compactar backup
        gzip "$backup_file"
        print_success "Backup criado: ${backup_file}.gz"
        
        # Mostrar tamanho do arquivo
        local file_size=$(du -h "${backup_file}.gz" | cut -f1)
        print_status "Tamanho do backup: $file_size"
        
        return 0
    else
        print_error "Erro ao criar backup"
        return 1
    fi
}

# ================================================
# FUNÇÃO DE RESTORE
# ================================================

restore_database() {
    local backup_file="$1"
    local restore_type="${2:-full}"
    
    if [ -z "$backup_file" ]; then
        print_error "Arquivo de backup não especificado"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    print_warning "⚠️  ATENÇÃO: Esta operação irá substituir os dados atuais!"
    read -p "Tem certeza que deseja continuar? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        print_status "Operação cancelada"
        return 0
    fi
    
    print_status "Iniciando restore do banco de dados..."
    
    # Descompactar se necessário
    local temp_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        temp_file="${backup_file%.gz}"
        print_status "Descompactando arquivo..."
        gunzip -c "$backup_file" > "$temp_file"
    fi
    
    if [ "$restore_type" = "clean" ]; then
        print_status "Limpando banco antes do restore..."
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    fi
    
    # Fazer restore
    print_status "Restaurando dados..."
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$temp_file"
    
    if [ $? -eq 0 ]; then
        print_success "Restore concluído com sucesso"
        
        # Limpar arquivo temporário se foi descompactado
        if [[ "$backup_file" == *.gz ]] && [ -f "$temp_file" ]; then
            rm "$temp_file"
        fi
        
        return 0
    else
        print_error "Erro ao fazer restore"
        return 1
    fi
}

# ================================================
# FUNÇÃO DE BACKUP DE ARQUIVOS
# ================================================

backup_files() {
    local backup_name="$1"
    
    if [ -z "$backup_name" ]; then
        backup_name="files_$(date +%Y%m%d_%H%M%S)"
    fi
    
    local backup_file="$BACKUP_DIR/files/${backup_name}.tar.gz"
    
    print_status "Iniciando backup de arquivos..."
    
    # Criar diretório se não existir
    mkdir -p "$BACKUP_DIR/files"
    
    # Fazer backup dos uploads e configurações
    tar -czf "$backup_file" \
        -C "/" \
        "opt/uploads" \
        "opt/sistema-gestao/.env" \
        "opt/sistema-gestao/config" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Backup de arquivos criado: $backup_file"
        
        local file_size=$(du -h "$backup_file" | cut -f1)
        print_status "Tamanho do backup: $file_size"
        
        return 0
    else
        print_error "Erro ao criar backup de arquivos"
        return 1
    fi
}

# ================================================
# FUNÇÃO DE LIMPEZA DE BACKUPS ANTIGOS
# ================================================

cleanup_backups() {
    local days="${1:-30}"
    
    print_status "Limpando backups com mais de $days dias..."
    
    # Limpar backups de banco
    local deleted_db=$(find "$BACKUP_DIR/database" -name "*.sql.gz" -mtime +$days -delete -print | wc -l)
    
    # Limpar backups de arquivos  
    local deleted_files=$(find "$BACKUP_DIR/files" -name "*.tar.gz" -mtime +$days -delete -print | wc -l)
    
    print_success "Removidos $deleted_db backups de banco e $deleted_files backups de arquivos"
}

# ================================================
# FUNÇÃO DE LISTAGEM DE BACKUPS
# ================================================

list_backups() {
    echo "=========================="
    echo "   BACKUPS DISPONÍVEIS"
    echo "=========================="
    echo
    
    echo "📁 Backups de Banco de Dados:"
    if [ -d "$BACKUP_DIR/database" ]; then
        ls -lh "$BACKUP_DIR/database"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ", " $6 " " $7 ")"}'
    else
        echo "  Nenhum backup encontrado"
    fi
    
    echo
    echo "📁 Backups de Arquivos:"
    if [ -d "$BACKUP_DIR/files" ]; then
        ls -lh "$BACKUP_DIR/files"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ", " $6 " " $7 ")"}'
    else
        echo "  Nenhum backup encontrado"
    fi
    echo
}

# ================================================
# FUNÇÃO DE MIGRAÇÃO DE DADOS
# ================================================

migrate_from_supabase() {
    local supabase_dump="$1"
    
    if [ -z "$supabase_dump" ]; then
        print_error "Arquivo de dump do Supabase não especificado"
        return 1
    fi
    
    if [ ! -f "$supabase_dump" ]; then
        print_error "Arquivo não encontrado: $supabase_dump"
        return 1
    fi
    
    print_status "Iniciando migração do Supabase..."
    
    # Criar arquivo temporário com dados limpos
    local temp_file="/tmp/supabase_clean.sql"
    
    print_status "Limpando dump do Supabase..."
    # Remover linhas específicas do Supabase que podem causar problemas
    sed -e '/^SET /d' \
        -e '/^--/d' \
        -e '/auth\./d' \
        -e '/storage\./d' \
        -e '/realtime\./d' \
        -e '/supabase_functions\./d' \
        -e '/vault\./d' \
        -e '/^CREATE EXTENSION/d' \
        "$supabase_dump" > "$temp_file"
    
    print_status "Aplicando dados migrados..."
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$temp_file"
    
    if [ $? -eq 0 ]; then
        print_success "Migração concluída com sucesso"
        rm "$temp_file"
        return 0
    else
        print_error "Erro na migração"
        rm "$temp_file"
        return 1
    fi
}

# ================================================
# MENU PRINCIPAL
# ================================================

show_menu() {
    echo "=========================="
    echo "   BACKUP & RESTORE"
    echo "=========================="
    echo
    echo "1. Fazer backup completo do banco"
    echo "2. Fazer backup apenas do schema"
    echo "3. Fazer backup de arquivos"
    echo "4. Restaurar banco de dados"
    echo "5. Listar backups disponíveis"
    echo "6. Limpar backups antigos"
    echo "7. Migrar do Supabase"
    echo "8. Sair"
    echo
}

# ================================================
# SCRIPT PRINCIPAL
# ================================================

main() {
    # Verificar se as variáveis de ambiente estão definidas
    if [ -z "$DB_PASSWORD" ]; then
        if [ -f "$APP_DIR/.env" ]; then
            export $(grep -v '^#' "$APP_DIR/.env" | xargs)
        else
            read -s -p "Digite a senha do banco de dados: " DB_PASSWORD
            echo
            export DB_PASSWORD
        fi
    fi
    
    case "$1" in
        "backup")
            backup_database "$2" "$3"
            ;;
        "backup-files")
            backup_files "$2"
            ;;
        "restore")
            restore_database "$2" "$3"
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            cleanup_backups "$2"
            ;;
        "migrate")
            migrate_from_supabase "$2"
            ;;
        "menu"|"")
            while true; do
                show_menu
                read -p "Escolha uma opção: " choice
                
                case $choice in
                    1)
                        read -p "Nome do backup (Enter para automático): " backup_name
                        backup_database "$backup_name" "full"
                        ;;
                    2)
                        read -p "Nome do backup (Enter para automático): " backup_name
                        backup_database "$backup_name" "schema"
                        ;;
                    3)
                        read -p "Nome do backup (Enter para automático): " backup_name
                        backup_files "$backup_name"
                        ;;
                    4)
                        read -p "Caminho do arquivo de backup: " backup_file
                        read -p "Tipo de restore (full/clean): " restore_type
                        restore_database "$backup_file" "$restore_type"
                        ;;
                    5)
                        list_backups
                        ;;
                    6)
                        read -p "Dias para manter (padrão 30): " days
                        cleanup_backups "${days:-30}"
                        ;;
                    7)
                        read -p "Caminho do dump do Supabase: " supabase_file
                        migrate_from_supabase "$supabase_file"
                        ;;
                    8)
                        print_status "Saindo..."
                        exit 0
                        ;;
                    *)
                        print_error "Opção inválida"
                        ;;
                esac
                
                echo
                read -p "Pressione Enter para continuar..."
                clear
            done
            ;;
        *)
            echo "Uso: $0 [backup|backup-files|restore|list|cleanup|migrate|menu]"
            echo
            echo "Exemplos:"
            echo "  $0 backup                          # Backup automático"
            echo "  $0 backup meu_backup full          # Backup nomeado"
            echo "  $0 restore /path/to/backup.sql.gz  # Restaurar backup"
            echo "  $0 migrate supabase_dump.sql       # Migrar do Supabase"
            echo "  $0 cleanup 7                       # Limpar backups > 7 dias"
            ;;
    esac
}

# Executar script
main "$@"