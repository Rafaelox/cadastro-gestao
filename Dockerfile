# Multi-stage build para frontend e backend
FROM node:20-alpine AS builder

# Build do frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa final: Node.js com Express e arquivos estáticos
FROM node:20-alpine

# Instalar supervisor para gerenciar múltiplos processos
RUN apk add --no-cache supervisor

# Criar diretórios
WORKDIR /app
RUN mkdir -p /var/log/supervisor

# Copiar dependências do servidor
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copiar código do servidor
COPY server/ ./server/

# Copiar frontend buildado
COPY --from=builder /app/dist ./dist

# Copiar arquivo de environment
COPY .env ./

# Configurar supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Iniciar supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
