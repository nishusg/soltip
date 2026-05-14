# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Use npm ci instead of npm install for faster, deterministic builds
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy custom nginx config that includes security headers & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
