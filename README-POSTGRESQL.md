# Sistema de Gestão - PostgreSQL VPS

Este projeto foi configurado para usar PostgreSQL em VPS, removendo a dependência do Supabase.

## Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no Easypanel ou no seu ambiente:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_gestao
DB_USER=gestao_user
DB_PASSWORD=sua_senha_segura

# Security
JWT_SECRET=seu_jwt_secret_muito_seguro
SESSION_SECRET=seu_session_secret_muito_seguro

# Application
NODE_ENV=production
```

### 2. Banco de Dados

O schema PostgreSQL está disponível em `schema-postgresql.sql`. Execute este arquivo no seu PostgreSQL para criar as tabelas necessárias.

### 3. Login de Teste

Para desenvolvimento, use:
- Email: `admin@teste.com`
- Senha: `admin123`

### 4. Deploy

O projeto está configurado para deploy no Easypanel usando o arquivo `Dockerfile.vps`.

## Estrutura

### Autenticação
- `src/contexts/AuthContext.tsx` - Context de autenticação PostgreSQL
- `src/services/auth-vps.service.ts` - Serviço de autenticação VPS
- `src/lib/database-vps.ts` - Conexão com PostgreSQL

### API
- `src/services/api.service.ts` - Serviço de API para frontend
- `src/lib/database-client.ts` - Cliente PostgreSQL compatível com Supabase

### Mobile
- Componentes mobile mantidos sem dependências Supabase
- Sistema de captura de fotos funcional

## Scripts Úteis

### Setup VPS
```bash
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

### Build Local
```bash
npm run build
```

### Deploy Easypanel
1. Configure o repositório GitHub no `easypanel.json`
2. Configure as variáveis de ambiente
3. Execute o deploy

## Migração do Supabase

As seguintes mudanças foram feitas:

1. ✅ Removido `@supabase/supabase-js`
2. ✅ Atualizado `AuthContext.tsx` para PostgreSQL
3. ✅ Criado `database-client.ts` compatível
4. ✅ Configurado `easypanel.json` para VPS
5. ✅ Corrigido imports dos componentes mobile

## Próximos Passos

1. Implementar API backend em Node.js/Express
2. Conectar com PostgreSQL real
3. Configurar autenticação JWT
4. Testar todas as funcionalidades

## Suporte

Para problemas, verifique:
1. Logs do container no Easypanel
2. Conexão com PostgreSQL
3. Variáveis de ambiente configuradas
4. Schema do banco aplicado