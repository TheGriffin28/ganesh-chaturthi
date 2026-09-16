#!/usr/bin/env bash
# ==============================================================================
# ganesh chaturthi — Staging & Deployment Runner
# Managed by Orbit (Nexora DevOps)
# ==============================================================================

set -e

echo "🚀 Starting ganesh chaturthi deployment..."

# Verify Docker daemon is running
docker info > /dev/null 2>&1 || { echo "❌ Docker daemon not running. Exiting."; exit 1; }

# Build and start services
docker compose up -d --build

echo "⏳ Waiting for service health check at http://localhost:3000/api/health..."
sleep 5

# Verify health check
curl -fsS http://localhost:3000/api/health || {
  echo "⚠️ Health check not immediately responding, inspecting container logs..."
  docker compose logs app --tail=20
  exit 1
}

echo "✅ ganesh chaturthi deployed successfully and healthy!"
