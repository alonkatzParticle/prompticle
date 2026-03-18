# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# OpenSSL required by Prisma on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
# Skip postinstall (prisma generate needs the schema which isn't here yet)
RUN npm ci --ignore-scripts

# ── Stage 2: Build the application ─────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema is now available)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# ── Stage 3: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

# Copy built Next.js app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma schema, migrations, seed script, and seed data
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prompts.json ./prompts.json

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["sh", "./entrypoint.sh"]
