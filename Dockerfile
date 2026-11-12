FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install OpenSSL and build essentials
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy root manifest and workspaces
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Install all dependencies
RUN npm ci

# Copy full repository source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY docs ./docs
COPY scripts ./scripts

# Build shared package, Prisma client, API, and Web bundles
RUN npm run build --workspace=packages/shared
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
RUN npm run build --workspace=apps/api
RUN npm run build --workspace=apps/web

# Production Runner
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install OpenSSL in the runner image so Prisma query engine loads reliably
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000
ENV COOKIE_SECURE=false

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/scripts ./scripts

EXPOSE 4000

CMD ["sh", "-c", "node scripts/setup.mjs && node apps/api/dist/index.js"]
