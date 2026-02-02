#!/bin/bash
# ============================================================================
# FinS - Start All Services Script
# Khởi động toàn bộ hệ thống FinS
# ============================================================================

set -e

PROJECT_DIR="$HOME/FinS/microservices/docker-compose"
cd "$PROJECT_DIR"

echo "🚀 Starting FinS Services..."
echo "============================"

# Check if certificates exist
if [ ! -f "mongodb-security/certs/ca.crt" ]; then
    echo "⚠️  TLS certificates not found. Running without TLS..."
    docker compose up -d
else
    echo "✅ TLS certificates found. Running with security enabled..."
    docker compose -f docker-compose.yml -f docker-compose.security.yml up -d
fi

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "============================================"
echo "✅ FinS Services Started!"
echo "============================================"
echo ""
echo "Access points (local):"
echo "  - Gateway:      http://localhost:8080"
echo "  - Frontend:     http://localhost:3000"
echo "  - Kafka UI:     http://localhost:9000"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
echo ""
