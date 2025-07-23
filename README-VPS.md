# Sistema de Gestão - Migração para VPS com PostgreSQL

Este guia detalha como migrar o sistema do Supabase para uma VPS com PostgreSQL.

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Acesso root à VPS
- Domínio configurado (opcional, mas recomendado)
- Pelo menos 2GB de RAM e 20GB de disco

## 🚀 Instalação Automatizada

### 1. Executar Script de Configuração

```bash
# Fazer download do script
wget https://raw.githubusercontent.com/[seu-repo]/setup-vps.sh

# Dar permissão de execução
chmod +x setup-vps.sh

# Executar (como root)
sudo ./setup-vps.sh
```

### 2. Aplicar Schema do Banco

```bash
# Fazer upload do arquivo schema-postgresql.sql para a VPS
scp schema-postgresql.sql root@sua-vps:/opt/sistema-gestao/

# Conectar na VPS e aplicar o schema
ssh root@sua-vps
cd /opt/sistema-gestao
sudo -u postgres psql -d sistema_gestao -f schema-postgresql.sql
```

## 📁 Estrutura de Arquivos

```
/opt/sistema-gestao/          # Aplicação principal
├── .env                      # Configurações
├── uploads/                  # Arquivos enviados
├── logs/                     # Logs da aplicação
└── SETUP_INFO.txt           # Informações da instalação

/opt/backups/                 # Backups
├── database/                 # Backups do banco
├── files/                    # Backups de arquivos
├── backup-db.sh             # Script de backup DB
└── backup-files.sh          # Script de backup arquivos
```

## 🔧 Configuração Manual (Alternativa)

### 1. Instalar PostgreSQL

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres createdb sistema_gestao
sudo -u postgres createuser --interactive gestao_user
sudo -u postgres psql -c "ALTER USER gestao_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sistema_gestao TO gestao_user;"
```

### 2. Configurar Aplicação

```bash
# Criar usuário da aplicação
useradd -m -s /bin/bash appuser

# Criar diretórios
mkdir -p /opt/sistema-gestao
mkdir -p /opt/uploads
mkdir -p /opt/backups

# Definir permissões
chown -R appuser:appuser /opt/sistema-gestao
chown -R appuser:appuser /opt/uploads
```

### 3. Configurar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Criar configuração (ver arquivo de exemplo)
nano /etc/nginx/sites-available/sistema-gestao

# Ativar site
ln -s /etc/nginx/sites-available/sistema-gestao /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🗄️ Migração de Dados do Supabase

### 1. Exportar Dados do Supabase

No painel do Supabase:
1. Vá em **Settings** → **Database**
2. Clique em **Database Export**
3. Baixe o arquivo SQL

### 2. Usar Script de Migração

```bash
# Usar o script de backup/restore
./backup-restore.sh migrate supabase_export.sql
```

### 3. Migração Manual

```bash
# Limpar dados específicos do Supabase
sed -i '/auth\./d; /storage\./d; /realtime\./d' supabase_export.sql

# Aplicar dados
psql -h localhost -U gestao_user -d sistema_gestao -f supabase_export.sql
```

## ⚙️ Configuração de Ambiente

Criar arquivo `.env` em `/opt/sistema-gestao/`:

```env
# Banco de Dados
DATABASE_URL=postgresql://gestao_user:sua_senha@localhost:5432/sistema_gestao
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_gestao
DB_USER=gestao_user
DB_PASSWORD=sua_senha

# Aplicação
NODE_ENV=production
PORT=3000
APP_URL=https://seu-dominio.com

# Segurança
JWT_SECRET=seu_jwt_secret_muito_seguro
SESSION_SECRET=seu_session_secret

# Upload
UPLOAD_DIR=/opt/uploads
MAX_FILE_SIZE=10485760

# Email (opcional)
SMTP_HOST=seu_smtp_host
SMTP_PORT=587
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
EMAIL_FROM=noreply@seu-dominio.com
```

## 🐳 Deploy com Docker

### 1. Build da Imagem

```bash
# Usar Dockerfile específico para VPS
docker build -f Dockerfile.vps -t sistema-gestao:latest .
```

### 2. Executar com Docker Compose

```bash
# Configurar variáveis no .env
# Executar
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Configuração de SSL

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seu-dominio.com

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 📊 Monitoramento

### Script de Monitoramento

```bash
# Executar script de monitoramento
/usr/local/bin/monitor-sistema.sh
```

### Logs Importantes

```bash
# Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log

# Logs do Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Logs da aplicação
tail -f /opt/sistema-gestao/logs/app.log
```

## 💾 Backup e Restore

### Backup Automático

```bash
# Backup do banco (configurado no cron)
/opt/backups/backup-db.sh

# Backup de arquivos
/opt/backups/backup-files.sh
```

### Backup Manual

```bash
# Usar script interativo
./backup-restore.sh menu

# Ou comandos diretos
./backup-restore.sh backup
./backup-restore.sh backup-files
```

### Restore

```bash
# Restaurar banco
./backup-restore.sh restore /opt/backups/database/backup_20240101_120000.sql.gz

# Listar backups
./backup-restore.sh list
```

## 🔧 Manutenção

### Limpeza de Logs

```bash
# Configurar logrotate (já incluído no script de setup)
# Limpar logs manualmente
find /var/log -name "*.log" -mtime +30 -delete
```

### Otimização do PostgreSQL

```bash
# Executar VACUUM e ANALYZE
sudo -u postgres psql -d sistema_gestao -c "VACUUM ANALYZE;"

# Verificar estatísticas
sudo -u postgres psql -d sistema_gestao -c "SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del FROM pg_stat_user_tables;"
```

### Verificar Performance

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Conexões PostgreSQL
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Status dos serviços
systemctl status postgresql nginx docker
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   ```bash
   # Verificar se PostgreSQL está rodando
   systemctl status postgresql
   
   # Verificar logs
   tail -f /var/log/postgresql/postgresql-*.log
   ```

2. **Erro 502 no Nginx**
   ```bash
   # Verificar se aplicação está rodando
   docker ps
   
   # Verificar logs do Nginx
   tail -f /var/log/nginx/error.log
   ```

3. **Problemas de permissão**
   ```bash
   # Corrigir permissões
   chown -R appuser:appuser /opt/sistema-gestao
   chown -R appuser:appuser /opt/uploads
   ```

### Comandos Úteis

```bash
# Reiniciar serviços
systemctl restart postgresql
systemctl restart nginx
docker-compose restart

# Verificar portas
netstat -tlnp | grep :5432  # PostgreSQL
netstat -tlnp | grep :80    # Nginx
netstat -tlnp | grep :3000  # Aplicação

# Verificar uso de recursos
free -h          # Memória
df -h            # Disco
top              # Processos
```

## 📞 Suporte

Para suporte adicional:

1. Verifique os logs em `/opt/sistema-gestao/logs/`
2. Execute o script de monitoramento: `monitor-sistema.sh`
3. Consulte a documentação técnica do PostgreSQL
4. Verifique os status dos serviços: `systemctl status`

## 📝 Changelog

- **v1.0**: Migração inicial do Supabase para PostgreSQL
- Configuração completa da VPS
- Scripts de backup e monitoramento
- Documentação completa

---

## ⚠️ Avisos Importantes

1. **Sempre faça backup antes de qualquer alteração**
2. **Altere as senhas padrão imediatamente**
3. **Configure SSL em produção**
4. **Monitore logs regularmente**
5. **Mantenha o sistema atualizado**

Este sistema está pronto para produção, mas requer configuração adequada de segurança e monitoramento.