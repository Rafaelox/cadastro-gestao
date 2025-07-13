# Build Stage
FROM node:18-alpine AS builder

# Build arguments for Supabase
ARG VITE_SUPABASE_URL=https://mmqorugxbsspuyqlraia.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcW9ydWd4YnNzcHV5cWxyYWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDM3MjYsImV4cCI6MjA2NzQ3OTcyNn0.8e3ohcVXPJVBvtw82aKmvAsCpf_8dfOjaB6U2g-hCTE

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build the application
RUN npm run build

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