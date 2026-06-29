#!/usr/bin/env bash
cd "$(dirname "$0")/.."

pkill -f "node_modules/.bin/nest start --watch" 2>/dev/null
pkill -f "node_modules/.bin/next dev" 2>/dev/null
pkill -f "uvicorn app:app --host 0.0.0.0 --port 8001" 2>/dev/null
docker compose stop postgres

echo "Stopped backend, frontend, whisper-service. Postgres container stopped (data kept)."
