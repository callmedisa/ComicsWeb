#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

docker compose up -d postgres

nohup bash -c "cd backend && npm run dev" > /tmp/comicsweb-backend.log 2>&1 &
disown
nohup bash -c "npm run dev" > /tmp/comicsweb-frontend.log 2>&1 &
disown
nohup bash -c "cd whisper-service && .venv/bin/uvicorn app:app --host 0.0.0.0 --port 8001" > /tmp/comicsweb-whisper.log 2>&1 &
disown

echo "Started. Logs: /tmp/comicsweb-backend.log /tmp/comicsweb-frontend.log /tmp/comicsweb-whisper.log"
echo "Frontend: http://localhost:3000"
