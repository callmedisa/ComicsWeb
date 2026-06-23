#!/bin/bash
# Stops all 5 ComicSpeak services. Postgres data is preserved (only the
# container is stopped, the named volume is untouched).
cd "$(dirname "$0")"

kill_port() {
  local port="$1"
  local label="$2"
  local pids
  pids=$(lsof -ti ":$port" 2>/dev/null)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null
    sleep 1
    # escalate if still alive
    pids=$(lsof -ti ":$port" 2>/dev/null)
    [ -n "$pids" ] && kill -9 $pids 2>/dev/null
    echo "    stopped (port $port)"
  else
    echo "    was not running"
  fi
}

echo "==> Next.js frontend"
kill_port 3000 frontend

echo "==> NestJS backend"
kill_port 3001 backend

echo "==> whisper-service"
kill_port 8001 whisper

echo "==> Ollama"
brew services stop ollama >/dev/null 2>&1 && echo "    stopped" || echo "    was not running"

echo "==> Postgres (Docker)"
docker compose down 2>/dev/null && echo "    stopped (data preserved in volume)" || echo "    was not running"

echo ""
echo "ComicSpeak is fully stopped."
