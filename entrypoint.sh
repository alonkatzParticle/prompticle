#!/bin/sh
set -e

echo "=========================================="
echo " Prompticle - Starting up"
echo "=========================================="

# Add node_modules/.bin to PATH so ts-node, prisma, etc. are found
export PATH="/app/node_modules/.bin:$PATH"

# Ensure the data directory exists (for SQLite volume mount)
mkdir -p /data

# Run Prisma migrations (safe to run on every start)
echo ">> Running database migrations..."
prisma migrate deploy

# Run seed (idempotent - skips if prompts already exist)
echo ">> Seeding database (idempotent)..."
prisma db seed

echo ">> Starting Next.js on port ${PORT:-3000}..."
exec next start -p "${PORT:-3000}"
