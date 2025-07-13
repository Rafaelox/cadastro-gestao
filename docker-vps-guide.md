# Sistema de Gestão - Guia de Deploy Docker VPS

Este guia detalha como fazer o deploy da aplicação Sistema de Gestão em um VPS usando Docker.

## 📋 Pré-requisitos

### No VPS:
- Ubuntu 20.04+ (ou similar)
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Pelo menos 2GB RAM e 20GB de espaço em disco

### Localmente:
- Git
- Acesso SSH ao VPS

## 🚀 Configuração Inicial do VPS

### 1. Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

### 2. Configurar Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

## 📁 Deploy da Aplicação

### 1. Clonar o Repositório

```bash
# No VPS
cd /opt
sudo mkdir apps
sudo chown $USER:$USER apps
cd apps

git clone <seu-repositorio> sistema-gestao
cd sistema-gestao
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.production

# Editar variáveis de produção
nano .env.production
```

Configurar as variáveis principais:
```env
NODE_ENV=production
PORT=80
DOMAIN=seu-dominio.com
VITE_SUPABASE_URL=https://mmqorugxbsspuyqlraia.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
ACME_EMAIL=seu-email@dominio.com
```

### 3. Deploy com Script Automatizado

```bash
# Tornar script executável
chmod +x deploy.sh

# Deploy de produção
./deploy.sh prod deploy
```

### 4. Deploy Manual (Alternativo)

```bash
# Build da imagem
docker compose -f docker-compose.prod.yml build

# Subir serviços
docker compose -f docker-compose.prod.yml up -d

# Verificar status
docker compose -f docker-compose.prod.yml ps
```

## 🔧 Comandos Úteis

### Monitoramento
```bash
# Ver logs em tempo real
./deploy.sh prod logs

# Status dos containers
./deploy.sh prod status

# Verificar health check
curl -f http://localhost/health
```

### Manutenção
```bash
# Reiniciar serviços
./deploy.sh prod restart

# Criar backup
./deploy.sh prod backup

# Limpar recursos não utilizados
./deploy.sh prod clean

# Rollback para versão anterior
./deploy.sh prod rollback
```

### Debug
```bash
# Entrar no container
docker exec -it sistema-gestao-prod sh

# Ver logs do nginx
docker exec sistema-gestao-prod cat /var/log/nginx/access.log
docker exec sistema-gestao-prod cat /var/log/nginx/error.log

# Verificar processo nginx
docker exec sistema-gestao-prod ps aux
```

## 🌐 Configuração de Domínio

### 1. DNS
Configure os seguintes registros DNS:
```
A    seu-dominio.com        -> IP_DO_VPS
A    www.seu-dominio.com    -> IP_DO_VPS
```

### 2. SSL com Let's Encrypt (Usando Traefik)

Se usar o Traefik incluído no docker-compose.prod.yml:

```bash
# Descomentar seção do Traefik no docker-compose.prod.yml
# Definir ACME_EMAIL no .env.production
# Reiniciar
docker compose -f docker-compose.prod.yml up -d
```

### 3. SSL Manual com Certbot

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento e Logs

### 1. Logs Estruturados
Os logs são salvos em formato JSON em `/var/log/nginx/` dentro do container.

### 2. Métricas
Acesse as métricas do Nginx em:
```
http://seu-ip/nginx-status
```

### 3. Health Check
```bash
# Health check da aplicação
curl -f http://seu-dominio.com/health

# Response esperado:
# {"status":"healthy","timestamp":"2024-01-01T12:00:00.000Z"}
```

## 🔒 Segurança

### 1. Headers de Segurança
O nginx.conf já inclui headers de segurança padrão:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy
- Strict-Transport-Security

### 2. Rate Limiting
- API: 10 requests/segundo
- Static files: 50 requests/segundo

### 3. User não-root
O container roda com usuário não-privilegiado (appuser).

## 🚨 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker logs sistema-gestao-prod

# Verificar configuração
docker exec sistema-gestao-prod nginx -t

# Verificar portas
sudo netstat -tlnp | grep :80
```

### Build falha
```bash
# Limpar cache do Docker
docker system prune -a

# Build sem cache
docker compose -f docker-compose.prod.yml build --no-cache
```

### SSL não funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --dry-run
```

### Performance Issues
```bash
# Verificar recursos
docker stats

# Verificar logs de erro
docker exec sistema-gestao-prod cat /var/log/nginx/error.log
```

## 📈 Otimizações de Performance

### 1. Nginx
- Gzip compression habilitado
- Cache de assets estáticos por 1 ano
- Keep-alive otimizado
- Buffer sizes configurados

### 2. Docker
- Multi-stage build para imagem menor
- Cache de layers otimizado
- Health checks configurados
- Resource limits definidos

### 3. Aplicação
- Build de produção otimizado
- Assets minificados
- Code splitting

## 🔄 CI/CD (Opcional)

### GitHub Actions
Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/apps/sistema-gestao
            git pull origin main
            ./deploy.sh prod deploy
```

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar logs: `./deploy.sh prod logs`
2. Verificar status: `./deploy.sh prod status`
3. Criar backup antes de mudanças: `./deploy.sh prod backup`
4. Documentar o problema com logs relevantes

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2024