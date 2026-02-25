#!/bin/bash
# Get current ngrok public URL
# Usage: ./scripts/get-ngrok-url.sh

set -e

echo "🔍 Getting ngrok public URL..."
echo ""

# Check if ngrok container is running
if ! docker ps --format '{{.Names}}' | grep -q "^ngrok$"; then
    echo "❌ Error: ngrok container is not running"
    echo "Start it with: docker-compose -f microservices/docker-compose/docker-compose.yml up -d ngrok"
    exit 1
fi

# Get the public URL from ngrok API
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | python -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Error: Could not get ngrok URL"
    echo "Check ngrok logs: docker logs ngrok"
    exit 1
fi

echo "✅ Ngrok is running!"
echo ""
echo "📡 Public URL: $PUBLIC_URL"
echo "🖥️  Web UI:     http://localhost:4040"
echo ""
echo "Test with:"
echo "  curl $PUBLIC_URL"
echo ""
echo "⚠️  Note: Free ngrok URLs change on each restart"
echo "    For static URLs, upgrade to ngrok paid plan with reserved domains"
