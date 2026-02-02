#!/bin/bash
# ============================================================================
# Build all Java microservices Docker images using Jib
# Run this script before docker-compose up
# ============================================================================

set -e

echo "🏗️  Building FinS Docker Images"
echo "================================"

PROJECT_DIR="$(dirname "$0")/.."
cd "$PROJECT_DIR"

SERVICES=(gateway userservice stockservice newsservice notificationservice crawlservice aitoolsservice)

for service in "${SERVICES[@]}"; do
    echo ""
    echo "📦 Building $service..."
    cd "$PROJECT_DIR/$service"
    
    # Make mvnw executable
    chmod +x mvnw 2>/dev/null || true
    
    # Build Docker image using Jib (no Docker daemon needed for build)
    ./mvnw compile jib:dockerBuild -DskipTests -Djib.to.image=$service:latest -q || {
        echo "⚠️  Failed to build $service, trying alternative method..."
        # Alternative: use spring-boot:build-image
        ./mvnw spring-boot:build-image -DskipTests -Dspring-boot.build-image.imageName=$service:latest -q || {
            echo "❌ Failed to build $service"
        }
    }
    
    echo "✅ $service built successfully"
done

# Build AI Service (Python)
echo ""
echo "📦 Building aiservice (Python)..."
cd "$PROJECT_DIR/aiservice"
docker build -t aiservice:latest . || echo "⚠️  aiservice build failed (optional)"

echo ""
echo "============================================"
echo "✅ All images built!"
echo "============================================"
echo ""
echo "Now run: docker compose up -d"
echo ""

# List built images
echo "📋 Built images:"
docker images | grep -E "gateway|userservice|stockservice|newsservice|notificationservice|crawlservice|aitoolsservice|aiservice" | head -10
