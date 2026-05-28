# Build Stage
FROM node:20 AS build

WORKDIR /app

# Use npm install to avoid strict peer-dependency errors that fail npm ci
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Define build arguments for Vite environment variables with safe defaults
ARG VITE_API_URL="https://soltip-api.kloudprompt.com/api"
ARG VITE_PROGRAM_ID="CzF4PuVgqAy19MzeGGgQwWM2qeeT1bJGehByTD5Hcqh8"
ARG VITE_PLATFORM_WALLET="A37oSqJxnWforsFzkE9ok7dEQ3YKj7MDnc8fvbGWuJWP"
ARG VITE_SOLANA_RPC_URL="https://api.devnet.solana.com"
ARG VITE_SITE_NAME="SolTip"
ARG VITE_SITE_URL="https://soltip.kloudprompt.com"
ARG VITE_PLATFORM_FEE="5"

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
FROM nginxinc/nginx-unprivileged:alpine

# Copy custom nginx config that includes security headers & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Run as the unprivileged nginx user
USER nginx

CMD ["nginx", "-g", "daemon off;"]
