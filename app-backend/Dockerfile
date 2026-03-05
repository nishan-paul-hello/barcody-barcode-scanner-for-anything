FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    python3 \
    make \
    util-linux-dev
WORKDIR /app
COPY package.json package-lock.json ./
COPY app-backend/package.json ./app-backend/
COPY app-web/package.json ./app-web/
COPY app-admin/package.json ./app-admin/
COPY app-mobile/package.json ./app-mobile/

# Configure npm to be more robust against network timeouts
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Use --include=dev if needed for building, but here we just need them for deps stage
RUN npm ci

# 2. Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/app-backend
RUN npm run build

# 3. Production runner
FROM base AS runner
RUN apk add --no-cache \
    cairo \
    pango \
    giflib \
    pixman \
    jpeg \
    freetype \
    fontconfig \
    ttf-freefont \
    util-linux \
    libstdc++ \
    libgcc
WORKDIR /app/app-backend

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy root node_modules (hoisted)
COPY --from=deps --chown=nestjs:nodejs /app/node_modules /app/node_modules
# Copy workspace node_modules (non-hoisted, if any)
COPY --from=deps --chown=nestjs:nodejs /app/app-backend/node_modules /app/app-backend/node_modules
# Copy built dist
COPY --from=builder --chown=nestjs:nodejs /app/app-backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/app-backend/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/app-backend/docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nestjs
EXPOSE 3002
ENV PORT=3002

ENTRYPOINT ["docker-entrypoint.sh"]

# Health check using the correct endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget --spider -q http://127.0.0.1:3002/api/v1/health || exit 1

CMD ["node", "dist/main"]
