# Dockerfile simplificado para EasyPanel
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Criar diretório da aplicação
WORKDIR /app

# Copiar e instalar dependências do frontend
COPY package*.json ./
RUN npm ci

# Copiar código do frontend e fazer build
COPY . .
RUN npm run build

# Copiar código do servidor
COPY server/ ./server/

# Instalar dependências do servidor
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install

# Voltar para o diretório principal
WORKDIR /app

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Iniciar apenas o servidor Node.js
CMD ["node", "server/index.js"]