# ImmoCalc - Dockerfile für Produktion
# Optimiert für Next.js Standalone Mode mit Prisma

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Provide a dummy DATABASE_URL for prisma generate (build-time only)
# The actual URL is provided at runtime by docker-compose
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client (generated during build)
# IMPORTANT: Must be AFTER standalone copy to avoid being overwritten
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install ONLY prisma CLI for migrations (as root before switching user)
# This properly creates the node_modules/.bin/prisma symlink
# IMPORTANT: Must run AFTER copying standalone to avoid being overwritten
RUN npm install prisma@7.2.0 --save-exact

# Fix ownership of prisma files for nextjs user
RUN chown -R nextjs:nodejs ./prisma ./node_modules/.prisma ./node_modules/@prisma ./node_modules/prisma && \
    chown nextjs:nodejs ./node_modules/.bin/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
