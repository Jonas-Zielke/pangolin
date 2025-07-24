#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js 20 is available
node_version=$(node -v 2>/dev/null || true)
if [[ ${node_version} != v20* ]]; then
  echo "Error: Node.js 20 is required. Current version: ${node_version}"
  exit 1
fi

# Install dependencies
npm ci

# Prepare configuration
if [ ! -f config/config.yml ]; then
  cp config/config.example.yml config/config.yml
fi

if ! grep -q 'base_url:' config/config.yml; then
  sed -i '/dashboard_url:/a\    base_url: "http://localhost:3002"' config/config.yml
fi

# Use SQLite database for development
mkdir -p server/db
echo 'export * from "./sqlite";' > server/db/index.ts

# Run SQLite migrations
npm run db:sqlite:generate
npm run db:sqlite:push

# Copy default Traefik configuration
if [ ! -d config/traefik ]; then
  cp -r install/config/traefik config/traefik
fi

# Build project
npm run build:sqlite
npm run build:cli

# Docker build tests as CI does
make build-sqlite
make build-pg
