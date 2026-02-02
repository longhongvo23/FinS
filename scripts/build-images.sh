#!/bin/bash
# ============================================================================
# FinS - Build All Docker Images
# Chạy script này trước khi docker compose up
# ============================================================================

set -e

echo "🏗️ Building FinS Docker Images..."
echo "=================================="

PROJECT_DIR="$HOME/FinS/microservices"

# Danh sách services cần build
SERVICES=(gateway userservice stockservice newsservice notificationservice crawlservice aitoolsservice)

for service in "${SERVICES[@]}"; do
    echo ""
    echo "📦 Building $service..."
    cd "$PROJECT_DIR/$service"
    
    # Ensure mvnw is executable
    chmod +x mvnw
    
    # Build with Jib to local Docker daemon
    ./mvnw -ntp compile jib:dockerBuild -Pprod -DskipTests -q || {
        echo "⚠️ Jib build failed for $service, trying alternative..."
        # Alternative: build JAR and use Dockerfile
        ./mvnw -ntp package -Pprod -DskipTests -q
        if [ -f "src/main/docker/Dockerfile.jvm" ]; then
            docker build -t $service -f src/main/docker/Dockerfile.jvm .
        fi
    }
    
    echo "✅ $service built successfully!"
done

# Build AI service (Python)
echo ""
echo "📦 Building aiservice (Python)..."
cd "$PROJECT_DIR/aiservice"
docker build -t aiservice .
echo "✅ aiservice built successfully!"

echo ""
echo "============================================"
echo "✅ All images built successfully!"
echo "============================================"
echo ""
echo "Now run: cd ~/FinS/microservices/docker-compose && docker compose up -d"
