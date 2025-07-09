# Deploy no EasyPanel

## Configuração Inicial

1. **Acesse o EasyPanel**
   - Faça login na sua instância do EasyPanel
   - Clique em "Create Service"

2. **Configurar Aplicação**
   - Nome: `cadastro-facil-gestao`
   - Tipo: `App`
   - Source: `Git Repository`

3. **Configuração do Git**
   - Repository URL: [URL do seu repositório]
   - Branch: `main`
   - Build Command: `docker build -t cadastro-facil .`

4. **Configuração de Deploy**
   - Port: `80`
   - Health Check Path: `/health`
   - Environment: `production`

## Configurações Avançadas

### Domínio Customizado
1. Vá em "Domains" no seu serviço
2. Adicione seu domínio personalizado
3. O SSL será configurado automaticamente

### Variáveis de Ambiente (se necessário)
```
NODE_ENV=production
VITE_SUPABASE_URL=https://mmqorugxbsspuyqlraia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Monitoramento
- Logs: Disponíveis na aba "Logs" do serviço
- Métricas: CPU, RAM e Network na aba "Metrics"
- Health Checks: Configurado para `/health`

## Deploy Automático

O EasyPanel irá fazer rebuild automático sempre que você fizer push para a branch configurada.

## Comandos Úteis

### Build Local (para testar)
```bash
docker build -t cadastro-facil .
docker run -p 3000:80 cadastro-facil
```

### Verificar Logs
```bash
# No EasyPanel, vá em Logs > Container Logs
```

## Solução de Problemas

1. **Build failing**: Verifique os logs de build no EasyPanel
2. **App não carrega**: Verifique se a porta 80 está exposta
3. **Rotas 404**: Confirme se o nginx.conf está configurado corretamente
4. **Performance**: Monitore CPU/RAM nas métricas do EasyPanel