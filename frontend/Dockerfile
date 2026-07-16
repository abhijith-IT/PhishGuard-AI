# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]