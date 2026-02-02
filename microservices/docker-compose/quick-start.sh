#!/bin/bash
# ============================================================================
# FinS Quick Start Script for WSL
# ============================================================================
# Chạy lệnh này: bash quick-start.sh
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FINS_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo "=============================================="
echo "  🚀 FinS Quick Start for WSL"
echo "=============================================="

# Step 1: Check Docker
echo ""
info "Step 1: Checking Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker not installed. Run: curl -fsSL https://get.docker.com | sudo sh"
fi

if ! docker info &> /dev/null; then
    error "Docker daemon not running. Run: sudo service docker start"
fi
log "Docker is ready"

# Step 2: Go to docker-compose directory
cd "$SCRIPT_DIR"
log "Working directory: $SCRIPT_DIR"

# Step 3: Copy .env file if needed
if [ ! -f .env ]; then
    warn ".env file not found, creating from template..."
    cat > .env << 'EOF'
# MongoDB Configuration
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=admin123

# Service Users
MONGODB_GATEWAY_USER=gateway_user
MONGODB_GATEWAY_PASSWORD=gateway_pass

MONGODB_USERSERVICE_USER=user_service_user
MONGODB_USERSERVICE_PASSWORD=user_service_pass

MONGODB_STOCKSERVICE_USER=stock_service_user
MONGODB_STOCKSERVICE_PASSWORD=stock_service_pass

MONGODB_NEWSSERVICE_USER=news_service_user
MONGODB_NEWSSERVICE_PASSWORD=news_service_pass

MONGODB_NOTIFICATION_USER=notification_user
MONGODB_NOTIFICATION_PASSWORD=notification_pass

MONGODB_CRAWLSERVICE_USER=crawl_service_user
MONGODB_CRAWLSERVICE_PASSWORD=crawl_service_pass

MONGODB_AITOOLS_USER=aitools_user
MONGODB_AITOOLS_PASSWORD=aitools_pass

# Field Encryption
ENCRYPTION_MASTER_KEY=your-256-bit-master-key-here-must-be-exactly-32-bytes

# API Keys (get free at respective websites)
TWELVE_DATA_API_KEY=your_twelve_data_api_key
FINNHUB_API_KEY=your_finnhub_api_key
VIETSTOCK_API_KEY=your_vietstock_api_key
HUGGINGFACE_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_gemini_api_key
EOF
    warn "Please edit .env file with your actual credentials!"
    log ".env file created"
fi

# Step 4: Check if infrastructure is running
echo ""
info "Step 2: Starting infrastructure (MongoDB, Kafka, Consul, Redis)..."
docker compose -f docker-compose.infra.yml up -d

echo ""
info "Step 3: Waiting for infrastructure to be healthy..."
sleep 10

# Check MongoDB
echo -n "  MongoDB: "
if docker exec mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}Ready${NC}"
else
    echo -e "${YELLOW}Starting...${NC}"
fi

# Check Consul
echo -n "  Consul: "
if curl -s http://localhost:8500/v1/status/leader | grep -q "8300"; then
    echo -e "${GREEN}Ready${NC}"
else
    echo -e "${YELLOW}Starting...${NC}"
fi

# Check Kafka
echo -n "  Kafka: "
if docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092 &> /dev/null 2>&1; then
    echo -e "${GREEN}Ready${NC}"
else
    echo -e "${YELLOW}Starting... (takes ~60s)${NC}"
fi

# Check Redis
echo -n "  Redis: "
if docker exec redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}Ready${NC}"
else
    echo -e "${YELLOW}Starting...${NC}"
fi

echo ""
echo "=============================================="
echo "  📊 Infrastructure Status"
echo "=============================================="
docker compose -f docker-compose.infra.yml ps

echo ""
echo "=============================================="
echo "  🔗 Access URLs"
echo "=============================================="
echo "  MongoDB:  mongodb://localhost:27017"
echo "  Consul:   http://localhost:8500"
echo "  Redis:    localhost:6379"
echo "  Kafka:    localhost:9092"

echo ""
echo "=============================================="
echo "  📝 Next Steps"
echo "=============================================="
echo ""
echo "Option A: Build services with Java/Maven (30+ minutes):"
echo "  cd ~/FinS/microservices/gateway"
echo "  ./mvnw clean package -DskipTests jib:dockerBuild"
echo ""
echo "Option B: Run services locally (development mode):"
echo "  # Install JDK 17"
echo "  sudo apt install -y openjdk-17-jdk"
echo ""
echo "  # Run each service individually:"
echo "  cd ~/FinS/microservices/gateway"
echo "  ./mvnw spring-boot:run"
echo ""
echo "Option C: Use pre-built images from GitHub (when available):"
echo "  docker compose -f docker-compose.yml up -d"
echo ""
log "Infrastructure is ready!"
