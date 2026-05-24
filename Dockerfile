# Build Stage
FROM node:20 AS build

WORKDIR /app

# Use npm install to avoid strict peer-dependency errors that fail npm ci
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Define build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_PROGRAM_ID
ARG VITE_PLATFORM_WALLET
ARG VITE_SOLANA_RPC_URL
ARG VITE_SITE_NAME
ARG VITE_SITE_URL
ARG VITE_PLATFORM_FEE

# Expose them as environment variables during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PROGRAM_ID=$VITE_PROGRAM_ID
ENV VITE_PLATFORM_WALLET=$VITE_PLATFORM_WALLET
ENV VITE_SOLANA_RPC_URL=$VITE_SOLANA_RPC_URL
ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_PLATFORM_FEE=$VITE_PLATFORM_FEE

RUN npm run build


# Production Stage
FROM nginx:alpine

# Copy custom nginx config that includes security headers & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
