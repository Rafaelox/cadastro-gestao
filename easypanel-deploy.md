# Deploy Sistema de Gestão - Easypanel

## 🚀 Configuração Rápida

### 1. Preparação do Projeto
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-gestao-comunicacao.git
cd sistema-gestao-comunicacao

# Instale dependências
npm install

# Teste local
npm run build
```

### 2. Deploy Automático via Easypanel

#### Opção A: Interface Web
1. **Acesse o Easypanel**: https://app.easypanel.io
2. **Criar Novo App**:
   - Nome: `sistema-gestao-comunicacao`
   - Source: Git Repository
   - Repository: `https://github.com/seu-usuario/sistema-gestao-comunicacao.git`
   - Branch: `main`

3. **Configurações**:
   - Build Type: `Dockerfile`
   - Port: `80`
   - Health Check: `/health`

#### Opção B: Arquivo de Configuração
Use o arquivo `easypanel.json` na raiz do projeto para deploy automático.

### 3. Variáveis de Ambiente

Configure no painel do Easypanel:
```env
NODE_ENV=production
VITE_SUPABASE_URL=https://mmqorugxbsspuyqlraia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Domínio Personalizado

1. **Adicionar Domínio**:
   - Vá em `Domains` no seu app
   - Adicione: `sistema-gestao.seudominio.com`
   - SSL será configurado automaticamente

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: sistema-gestao
   Value: app.easypanel.io
   ```

## 🛠️ Deploy via Script

Use o script automatizado:
```bash
chmod +x deploy-easypanel.sh
./deploy-easypanel.sh production
```

## 📊 Monitoramento

### Logs
- **Container Logs**: Easypanel → App → Logs
- **Build Logs**: Easypanel → App → Builds

### Métricas
- **CPU/RAM**: Dashboard → Metrics
- **Uptime**: Dashboard → Overview
- **Health Checks**: Automatic via `/health`

### Alertas (Opcional)
Configure alerts para:
- CPU > 80%
- Memory > 80%
- Error Rate > 5%

## 🔧 Comandos Úteis

### Build Local
```bash
docker build -t sistema-gestao .
docker run -p 3000:80 sistema-gestao
```

### Debug
```bash
# Logs do container
docker logs <container-id>

# Shell no container
docker exec -it <container-id> /bin/sh
```

## 🚨 Solução de Problemas

### Build Failing
1. Verifique `package.json` dependencies
2. Confirme versão do Node.js (18+)
3. Check build logs no Easypanel

### App não carrega
1. Confirme porta 80 exposta
2. Verifique health check `/health`
3. Check container logs

### Rotas 404
1. Confirme `nginx.conf` configurado
2. Verifique SPA routing config
3. Check `try_files` directive

### Performance Issues
1. Monitore CPU/RAM usage
2. Configure resource limits
3. Optimize bundle size

## 📈 Otimizações

### Performance
- **Gzip**: Habilitado por padrão
- **Cache**: Assets cachados por 1 ano
- **Minificação**: Build automático

### Segurança
- **Security Headers**: Configurados no nginx
- **HTTPS**: SSL automático
- **CSP**: Content Security Policy ativo

### Escalabilidade
- **Auto-scaling**: 1-3 replicas
- **Load Balancing**: Automático
- **Health Checks**: Configurado

## 📋 Checklist de Deploy

- [ ] Repositório Git configurado
- [ ] Build local funcionando
- [ ] Docker build testado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio DNS apontado
- [ ] Health check respondendo
- [ ] SSL certificado ativo
- [ ] Monitoramento configurado

## 🔗 Links Úteis

- [Easypanel Docs](https://easypanel.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)