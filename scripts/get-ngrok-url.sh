#!/bin/bash
# Get current ngrok public URL
# Usage: ./scripts/get-ngrok-url.sh

set -e

# Static domain configured in docker-compose.yml
STATIC_DOMAIN="gabrielle-polymeric-iconoclastically.ngrok-free.dev"

echo "🔍 Getting ngrok public URL..."
echo ""

# Check if ngrok container is running
if ! docker ps --format '{{.Names}}' | grep -q "^ngrok$"; then
    echo "❌ Error: ngrok container is not running"
    echo "Start it with: docker-compose -f microservices/docker-compose/docker-compose.yml up -d ngrok"
    exit 1
fi

echo "✅ Ngrok is running with STATIC DOMAIN!"
echo ""
echo "📡 Static URL: https://$STATIC_DOMAIN"
echo "🖥️  Web UI:    http://localhost:4040"
echo ""
echo "Test with:"
echo "  curl https://$STATIC_DOMAIN"
echo ""
echo "✨ This URL is PERMANENT - never changes on restart!"
echo "   Share this with your team: https://$STATIC_DOMAIN"
