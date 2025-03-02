# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - simplified to use Nginx
FROM nginx:alpine

# Copy built app to Nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.simplified.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]