#!/bin/bash

# ================================================
# SCRIPT DE CONFIGURAÇÃO PARA VPS
# Sistema de Gestão com PostgreSQL
# ================================================

set -e

echo "🚀 Iniciando configuração da VPS..."

# Variáveis de configuração
DB_NAME="sistema_gestao"
DB_USER="gestao_user"
DB_PASSWORD="$(openssl rand -base64 32)"
APP_USER="appuser"
APP_DIR="/opt/sistema-gestao"
BACKUP_DIR="/opt/backups"
DOMAIN="${DOMAIN:-localhost}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
# VERIFICAÇÕES INICIAIS
# ================================================

print_status "Verificando sistema operacional..."
if ! command -v apt &> /dev/null; then
    print_error "Este script é para sistemas Ubuntu/Debian"
    exit 1
fi

print_status "Verificando se está rodando como root..."
if [[ $EUID -ne 0 ]]; then
   print_error "Este script deve ser executado como root"
   exit 1
fi

# ================================================
# ATUALIZAÇÃO DO SISTEMA
# ================================================

print_status "Atualizando sistema..."
apt update && apt upgrade -y

print_status "Instalando dependências básicas..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx

# ================================================
# INSTALAÇÃO DO POSTGRESQL
# ================================================

print_status "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib postgresql-client

print_status "Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Configurar PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Configurações de segurança do PostgreSQL
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Backup das configurações originais
cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup"
cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"

# Configurar postgresql.conf
cat >> "$PG_CONFIG_DIR/postgresql.conf" << EOF

# Configurações de performance
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Configurações de log
log_destination = 'csvlog'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 10MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 10MB
EOF

systemctl restart postgresql

print_success "PostgreSQL instalado e configurado"

# ================================================
# INSTALAÇÃO DO DOCKER
# ================================================

print_status "Instalando Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl start docker
systemctl enable docker

print_success "Docker instalado"

# ================================================
# INSTALAÇÃO DO NODE.JS
# ================================================

print_status "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

print_success "Node.js $(node --version) instalado"

# ================================================
# CONFIGURAÇÃO DO USUÁRIO DA APLICAÇÃO
# ================================================

print_status "Criando usuário da aplicação..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    usermod -aG docker "$APP_USER"
fi

# Criar diretórios
mkdir -p "$APP_DIR"
mkdir -p "$BACKUP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$BACKUP_DIR"

print_success "Usuário $APP_USER criado"

# ================================================
# CONFIGURAÇÃO DO FIREWALL
# ================================================

print_status "Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp # PostgreSQL (apenas se necessário)
ufw --force enable

print_success "Firewall configurado"

# ================================================
# CONFIGURAÇÃO DO FAIL2BAN
# ================================================

print_status "Configurando Fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

systemctl restart fail2ban
systemctl enable fail2ban

print_success "Fail2ban configurado"

# ================================================
# CONFIGURAÇÃO DO NGINX
# ================================================

print_status "Configurando Nginx..."
cat > /etc/nginx/sites-available/sistema-gestao << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/m;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /api/auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sistema-gestao /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

print_success "Nginx configurado"

# ================================================
# SCRIPTS DE BACKUP
# ================================================

print_status "Criando scripts de backup..."

# Script de backup do banco
cat > "$BACKUP_DIR/backup-db.sh" << EOF
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR/database"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"

mkdir -p "\$BACKUP_DIR"

# Backup completo
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U "\$DB_USER" -d "\$DB_NAME" > "\$BACKUP_DIR/backup_\$DATE.sql"

# Compactar backup
gzip "\$BACKUP_DIR/backup_\$DATE.sql"

# Manter apenas backups dos últimos 30 dias
find "\$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup realizado: backup_\$DATE.sql.gz"
EOF

chmod +x "$BACKUP_DIR/backup-db.sh"

# Script de backup de arquivos
cat > "$BACKUP_DIR/backup-files.sh" << EOF
#!/bin/bash
BACKUP_DIR="$BACKUP_DIR/files"
DATE=\$(date +%Y%m%d_%H%M%S)
APP_DIR="$APP_DIR"

mkdir -p "\$BACKUP_DIR"

# Backup dos uploads e configurações
tar -czf "\$BACKUP_DIR/files_\$DATE.tar.gz" -C "\$APP_DIR" uploads config

# Manter apenas backups dos últimos 7 dias
find "\$BACKUP_DIR" -name "files_*.tar.gz" -mtime +7 -delete

echo "Backup de arquivos realizado: files_\$DATE.tar.gz"
EOF

chmod +x "$BACKUP_DIR/backup-files.sh"

# Crontab para backups automáticos
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/backup-db.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 $BACKUP_DIR/backup-files.sh") | crontab -

print_success "Scripts de backup criados"

# ================================================
# SCRIPT DE MONITORAMENTO
# ================================================

print_status "Criando script de monitoramento..."

cat > /usr/local/bin/monitor-sistema.sh << EOF
#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================="
echo "   MONITOR DO SISTEMA"
echo "=========================="
echo

# Status dos serviços
echo "📋 Status dos Serviços:"
services=("postgresql" "nginx" "docker" "fail2ban")
for service in "\${services[@]}"; do
    if systemctl is-active --quiet "\$service"; then
        echo -e "  ✅ \$service: ${GREEN}ATIVO${NC}"
    else
        echo -e "  ❌ \$service: ${RED}INATIVO${NC}"
    fi
done

echo

# Uso de recursos
echo "💻 Uso de Recursos:"
echo -e "  CPU: \$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | cut -d'%' -f1)%"
echo -e "  RAM: \$(free | grep Mem | awk '{printf \"%.1f%%\", \$3/\$2 * 100.0}')"
echo -e "  Disco: \$(df -h / | awk 'NR==2{printf \"%s\", \$5}')"

echo

# Conexões PostgreSQL
echo "🗄️  PostgreSQL:"
PG_CONNECTIONS=\$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "0")
echo -e "  Conexões ativas: \$PG_CONNECTIONS"

# Tamanho do banco
DB_SIZE=\$(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null || echo "N/A")
echo -e "  Tamanho do banco: \$DB_SIZE"

echo

# Status do Docker
echo "🐳 Docker:"
if command -v docker &> /dev/null; then
    CONTAINERS=\$(docker ps -q | wc -l)
    echo -e "  Containers ativos: \$CONTAINERS"
else
    echo -e "  Docker não encontrado"
fi

echo

# Últimos logs de erro
echo "📝 Últimos erros (Nginx):"
tail -n 3 /var/log/nginx/error.log 2>/dev/null | head -n 3 || echo "  Nenhum erro recente"

echo
echo "=========================="
EOF

chmod +x /usr/local/bin/monitor-sistema.sh

print_success "Script de monitoramento criado"

# ================================================
# CRIAÇÃO DO ARQUIVO DE AMBIENTE
# ================================================

print_status "Criando arquivo de configuração..."

cat > "$APP_DIR/.env" << EOF
# Configurações do Banco de Dados
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Configurações da Aplicação
NODE_ENV=production
PORT=3000
APP_URL=http://$DOMAIN

# Configurações de Segurança
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 32)

# Configurações de Upload
UPLOAD_DIR=/opt/uploads
MAX_FILE_SIZE=10485760

# Configurações de Email (configure conforme necessário)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@$DOMAIN

# Backup
BACKUP_DIR=$BACKUP_DIR
EOF

chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

print_success "Arquivo de configuração criado"

# ================================================
# APLICAR SCHEMA DO BANCO
# ================================================

print_status "Aplicando schema do banco de dados..."

if [ -f "schema-postgresql.sql" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f schema-postgresql.sql
    print_success "Schema aplicado com sucesso"
else
    print_warning "Arquivo schema-postgresql.sql não encontrado. Execute manualmente após fazer upload do arquivo."
fi

# ================================================
# CONFIGURAÇÕES FINAIS
# ================================================

print_status "Criando diretórios de upload..."
mkdir -p /opt/uploads/{documents,photos,profiles}
chown -R "$APP_USER:$APP_USER" /opt/uploads
chmod -R 755 /opt/uploads

# Logrotate para aplicação
cat > /etc/logrotate.d/sistema-gestao << EOF
/opt/sistema-gestao/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $APP_USER $APP_USER
}
EOF

# ================================================
# INFORMAÇÕES FINAIS
# ================================================

print_success "🎉 Configuração da VPS concluída!"
echo
echo "================================================"
echo "           INFORMAÇÕES DO SISTEMA"
echo "================================================"
echo
echo "🗄️  BANCO DE DADOS:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo "   Senha: $DB_PASSWORD"
echo
echo "👤 USUÁRIO DA APLICAÇÃO:"
echo "   Usuário: $APP_USER"
echo "   Diretório: $APP_DIR"
echo
echo "📁 DIRETÓRIOS IMPORTANTES:"
echo "   Aplicação: $APP_DIR"
echo "   Backups: $BACKUP_DIR"
echo "   Uploads: /opt/uploads"
echo
echo "🔧 COMANDOS ÚTEIS:"
echo "   Monitorar sistema: monitor-sistema.sh"
echo "   Backup manual: $BACKUP_DIR/backup-db.sh"
echo "   Ver logs nginx: tail -f /var/log/nginx/error.log"
echo "   Ver logs postgres: tail -f /var/log/postgresql/postgresql-*.log"
echo
echo "🔐 LOGIN INICIAL:"
echo "   Email: admin@sistema.com"
echo "   Senha: admin123"
echo "   ⚠️  ALTERE A SENHA IMEDIATAMENTE!"
echo
echo "📋 PRÓXIMOS PASSOS:"
echo "   1. Faça upload dos arquivos da aplicação para $APP_DIR"
echo "   2. Configure SSL com: certbot --nginx -d $DOMAIN"
echo "   3. Teste a aplicação e altere a senha do admin"
echo "   4. Configure backups externos se necessário"
echo
echo "================================================"

# Salvar informações em arquivo
cat > "$APP_DIR/SETUP_INFO.txt" << EOF
CONFIGURAÇÃO DO SISTEMA - $(date)
================================

BANCO DE DADOS:
Host: localhost
Porta: 5432
Banco: $DB_NAME
Usuário: $DB_USER
Senha: $DB_PASSWORD

URL DE CONEXÃO:
postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

USUÁRIO INICIAL:
Email: admin@sistema.com
Senha: admin123

DIRETÓRIOS:
- Aplicação: $APP_DIR
- Backups: $BACKUP_DIR
- Uploads: /opt/uploads

SERVIÇOS CONFIGURADOS:
- PostgreSQL
- Nginx
- Docker
- Fail2ban
- Backup automático

COMANDOS ÚTEIS:
- monitor-sistema.sh (monitoramento)
- systemctl status [serviço]
- $BACKUP_DIR/backup-db.sh (backup manual)
EOF

chown "$APP_USER:$APP_USER" "$APP_DIR/SETUP_INFO.txt"

print_success "Arquivo de informações salvo em $APP_DIR/SETUP_INFO.txt"
print_warning "⚠️  IMPORTANTE: Altere as senhas padrão antes de usar em produção!"