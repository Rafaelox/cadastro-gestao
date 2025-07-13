# Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application with debug output
RUN npm run build

# Debug: Verify build output
RUN echo "=== Build completed, checking dist folder ===" && \
    ls -la dist/ && \
    echo "=== Content of index.html ===" && \
    head -20 dist/index.html && \
    echo "=== Assets folder ===" && \
    ls -la dist/assets/ || echo "No assets folder found"

# Production Stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]