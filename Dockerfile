# Etapa 1: Build do frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN echo "Starting build process..." && \
    npm run build && \
    echo "Build completed. Checking dist folder:" && \
    ls -la dist/ && \
    echo "Dist contents:" && \
    find dist/ -type f | head -20

# Etapa 2: NGINX para servir a aplicação
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Verify files are copied correctly
RUN echo "Verifying nginx html folder:" && \
    ls -la /usr/share/nginx/html/ && \
    echo "Checking index.html:" && \
    head -10 /usr/share/nginx/html/index.html || echo "index.html not found"

# Create log directories
RUN mkdir -p /var/log/nginx

# Expose port
EXPOSE 80

# Add health check and start nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
