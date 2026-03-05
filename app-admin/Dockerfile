FROM node:20-slim AS base

FROM base AS deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
COPY app-backend/package.json ./app-backend/
COPY app-web/package.json ./app-web/
COPY app-admin/package.json ./app-admin/
COPY app-mobile/package.json ./app-mobile/
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000
RUN npm ci

FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
RUN if [ -z "$NEXT_PUBLIC_API_URL" ]; then echo "Error: NEXT_PUBLIC_API_URL build argument must be set"; exit 1; fi
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/app-admin
RUN npm run build

FROM base AS runner
RUN apt-get update && apt-get install -y \
    wget \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/app-admin/public ./app-admin/public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/app-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app-admin/.next/static ./app-admin/.next/static

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget --spider -q http://localhost:3001/api/health || exit 1

CMD ["node", "app-admin/server.js"]
