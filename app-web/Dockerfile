FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache \
    libc6-compat \
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
    make
WORKDIR /app
COPY package.json package-lock.json ./
COPY app-backend/package.json ./app-backend/
COPY app-web/package.json ./app-web/
COPY app-admin/package.json ./app-admin/
COPY mobile-app/package.json ./mobile-app/
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
WORKDIR /app/app-web
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/app-web/public ./app-web/public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/app-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app-web/.next/static ./app-web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget --spider -q http://localhost:3000/api/health || exit 1

CMD ["node", "app-web/server.js"]
