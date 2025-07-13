# Multi-stage build for optimized production image
ARG NODE_VERSION=18
ARG NGINX_VERSION=alpine

# ====================
# Build Stage
# ====================
FROM node:${NODE_VERSION}-alpine AS builder

# Build arguments
ARG BUILD_ENV=production
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Add labels for metadata
LABEL maintainer="Sistema de Gestão"
LABEL description="Sistema de Gestão - Frontend React Application"
LABEL version="1.0.0"

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies for build (including devDependencies for vite)
RUN npm ci --silent && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application with environment variables
ENV NODE_ENV=production
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

RUN npm run build

# ====================
# Production Stage
# ====================
FROM nginx:${NGINX_VERSION}

# Install additional packages for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/nginx.conf

# Create nginx directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Environment variables
ENV PORT=80
ENV NODE_ENV=production

# Expose configurable port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Switch to non-root user
USER appuser

# Start nginx
CMD ["sh", "-c", "exec nginx -g 'daemon off;'"]