# Dockerfile otimizado para EasyPanel
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Criar diretório da aplicação
WORKDIR /app

# Copiar e instalar dependências do frontend
COPY package*.json ./
RUN npm ci

# Copiar dependências do servidor
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Voltar para o diretório principal e copiar código
WORKDIR /app
COPY . .

# Fazer build do frontend
RUN npm run build

# Verificar se o build foi criado
RUN ls -la dist/ || echo "Erro: diretório dist não foi criado"

# Expor porta
EXPOSE 3000

# Health check - using simple endpoint initially
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:3000/health/simple || curl -f http://localhost:3000/health || exit 1

# Iniciar apenas o servidor Node.js
CMD ["node", "server/index.js"]