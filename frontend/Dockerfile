# Multi-stage Dockerfile for React/Vite Frontend with Nginx

# --- Stage 1: Build React/Vite Application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests and install packages
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build argument for API base URL (defaults to /api for reverse proxy through Nginx)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.27-alpine

# Copy custom Nginx configuration supporting React Router and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check to ensure Nginx is healthy
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
