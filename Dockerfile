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
EXPOSE 80

# Health check - using simple endpoint with generous timing
HEALTHCHECK --interval=45s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:80/health/simple || curl -f http://localhost:80/status || exit 1

# Iniciar o servidor com script de startup detalhado
CMD ["node", "server/startup.js"]