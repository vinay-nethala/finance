# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate 1M transaction records
RUN npm run generate-data

# Build the Vite app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the generated transactions.json into the served directory
COPY --from=builder /app/public/transactions.json /usr/share/nginx/html/transactions.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
