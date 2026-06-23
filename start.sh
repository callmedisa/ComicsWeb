#!/bin/bash
# Starts all 5 services ComicSpeak needs: Postgres (Docker), Ollama, the
# whisper-service (Python/FastAPI), the NestJS backend, and the Next.js frontend.
set -e
cd "$(dirname "$0")"

echo "==> Postgres (Docker)"
if ! docker info >/dev/null 2>&1; then
  echo "    starting Docker Desktop, waiting for it to come up..."
  open -a Docker
  for i in $(seq 1 60); do
    docker info >/dev/null 2>&1 && break
    sleep 2
  done
fi
docker compose up -d
for i in $(seq 1 20); do
  docker exec comicsweb-postgres-1 pg_isready -U comicspeak >/dev/null 2>&1 && break
  sleep 1
done
echo "    ok (localhost:5432)"

echo "==> Ollama"
brew services start ollama >/dev/null
for i in $(seq 1 20); do
  curl -sf http://localhost:11434/api/version >/dev/null 2>&1 && break
  sleep 1
done
echo "    ok (localhost:11434)"

echo "==> whisper-service"
if curl -sf http://localhost:8001/health >/dev/null 2>&1; then
  echo "    already running (localhost:8001)"
else
  (cd whisper-service && source .venv/bin/activate && nohup uvicorn app:app --host 0.0.0.0 --port 8001 > /tmp/comicsweb-whisper.log 2>&1 &)
  for i in $(seq 1 60); do
    curl -sf http://localhost:8001/health >/dev/null 2>&1 && break
    sleep 2
  done
  echo "    ok (localhost:8001) — log: /tmp/comicsweb-whisper.log"
fi

echo "==> NestJS backend"
if curl -sf http://localhost:3001/api/me >/dev/null 2>&1; then
  echo "    already running (localhost:3001)"
else
  (cd backend && nohup npm run dev > /tmp/comicsweb-backend.log 2>&1 &)
  for i in $(seq 1 30); do
    curl -sf http://localhost:3001/api/me >/dev/null 2>&1 && break
    sleep 1
  done
  echo "    ok (localhost:3001) — log: /tmp/comicsweb-backend.log"
fi

echo "==> Next.js frontend"
if curl -sf http://localhost:3000 >/dev/null 2>&1; then
  echo "    already running (localhost:3000)"
else
  nohup npm run dev > /tmp/comicsweb-dev.log 2>&1 &
  for i in $(seq 1 30); do
    curl -sf http://localhost:3000 >/dev/null 2>&1 && break
    sleep 1
  done
  echo "    ok (localhost:3000) — log: /tmp/comicsweb-dev.log"
fi

echo ""
echo "ComicSpeak is up: http://localhost:3000"
