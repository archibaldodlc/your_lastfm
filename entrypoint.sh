#!/bin/sh

mkdir -p /app/data
[ ! -f /app/data/stats.db ] && touch /app/data/stats.db

echo "🔄 Passo 1: Sincronizando scrobbles (index.js)..."
node src/index.js

echo "🚀 Passo 2: Subindo API em background (api.js)..."

pm2-runtime start src/api.js --name "minha-api"