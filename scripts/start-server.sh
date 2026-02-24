#!/bin/bash
# ============================================================================
# FinS - One-Click Server Startup Script (WSL2)
# Khởi động toàn bộ hệ thống FinS với bảo mật 4 lớp
#
# Usage: bash /mnt/d/HOC_DAI/DATN2025/FinS/scripts/start-server.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

COMPOSE_DIR="/mnt/d/HOC_DAI/DATN2025/FinS/microservices/docker-compose"
COMPOSE_CMD="docker compose"

print_header() {
    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

print_step() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[→]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ============================================================================
# Step 1: Start Docker
# ============================================================================
print_header "🚀 FinS Server Startup (GHCR + 4-Layer Security)"

print_info "Checking Docker..."
if docker info > /dev/null 2>&1; then
    print_step "Docker is running"
else
    print_info "Docker not responding, trying to start..."
    sudo service docker start 2>/dev/null || true
    sleep 3
    if docker info > /dev/null 2>&1; then
        print_step "Docker started successfully"
    else
        print_error "Docker failed to start. Please start Docker Desktop or run: sudo service docker start"
        exit 1
    fi
fi

# ============================================================================
# Step 2: Navigate to compose directory
# ============================================================================
cd "$COMPOSE_DIR"
print_step "Working directory: $COMPOSE_DIR"

# ============================================================================
# Step 3: Check prerequisites
# ============================================================================
print_info "Checking prerequisites..."

# Check .env file
if [ ! -f ".env" ]; then
    print_error ".env file not found! Please create it with required variables."
    exit 1
fi
print_step ".env file found"

# Check TLS certificates
if [ ! -f "mongodb-security/certs/ca.crt" ] || [ ! -f "mongodb-security/certs/gateway-mongodb.pem" ]; then
    print_error "TLS certificates not found in mongodb-security/certs/"
    print_info "Run: cd mongodb-security/scripts && ./generate-certs.sh"
    exit 1
fi
print_step "TLS certificates found"

# Check GHCR login
if ! docker pull ghcr.io/longhongvo23/fins-gateway:latest > /dev/null 2>&1; then
    print_warn "Cannot pull GHCR images. Trying to login..."
    print_info "Please run: echo 'YOUR_TOKEN' | docker login ghcr.io -u longhongvo23 --password-stdin"
    print_info "Continuing with local images (if available)..."
fi

# ============================================================================
# Step 4: Stop old containers (if any)
# ============================================================================
print_info "Stopping old containers (if any)..."
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true
print_step "Old containers cleaned up"

# ============================================================================
# Step 5: Pull latest images
# ============================================================================
print_info "Pulling latest GHCR images..."
$COMPOSE_CMD pull 2>/dev/null || print_warn "Some images failed to pull, using cached versions"
print_step "Images ready"

# ============================================================================
# Step 6: Start all services
# ============================================================================
print_header "🔒 Starting with 4-Layer Security"
echo -e "  ${GREEN}Layer 1:${NC} Authentication (MongoDB users + JWT)"
echo -e "  ${GREEN}Layer 2:${NC} TLS/SSL encryption (MongoDB traffic)"
echo -e "  ${GREEN}Layer 3:${NC} Field-level encryption (@Encrypted + MASTER_KEY)"
echo -e "  ${GREEN}Layer 4:${NC} Volume encryption (Docker named volume + BitLocker)"
echo ""

print_info "Starting infrastructure services first..."
$COMPOSE_CMD up -d mongodb consul consul-config-loader kafka zookeeper redis
echo ""

# ============================================================================
# Step 7: Wait for MongoDB to be healthy
# ============================================================================
print_info "Waiting for MongoDB to be healthy (TLS mode)..."
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' mongodb 2>/dev/null || echo "not found")
    if [ "$STATUS" = "healthy" ]; then
        print_step "MongoDB is healthy (TLS enabled) ✅"
        break
    elif [ "$STATUS" = "unhealthy" ]; then
        print_error "MongoDB is unhealthy. Checking logs..."
        docker logs mongodb 2>&1 | tail -10
        echo ""
        print_info "Attempting to restart MongoDB..."
        docker restart mongodb
        sleep 10
    fi
    RETRIES=$((RETRIES + 1))
    echo -ne "\r  Waiting for MongoDB... ($RETRIES/$MAX_RETRIES) - Status: $STATUS"
    sleep 5
done
echo ""

if [ "$STATUS" != "healthy" ]; then
    print_error "MongoDB failed to start. Showing logs:"
    docker logs mongodb 2>&1 | tail -20
    echo ""
    print_error "Please check the logs above and fix the issue."
    exit 1
fi

# Wait for Consul
print_info "Waiting for Consul..."
sleep 5
print_step "Consul is ready"

# ============================================================================
# Step 8: Start application services
# ============================================================================
print_info "Starting application services..."
$COMPOSE_CMD up -d gateway userservice stockservice newsservice notificationservice
echo ""

# Wait for gateway to be healthy before starting dependent services
print_info "Waiting for core services to start..."
RETRIES=0
MAX_RETRIES=24
while [ $RETRIES -lt $MAX_RETRIES ]; do
    GW_STATUS=$(docker inspect --format='{{.State.Health.Status}}' gateway 2>/dev/null || echo "starting")
    STOCK_STATUS=$(docker inspect --format='{{.State.Health.Status}}' stockservice 2>/dev/null || echo "starting")
    NEWS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' newsservice 2>/dev/null || echo "starting")
    
    if [ "$GW_STATUS" = "healthy" ] && [ "$STOCK_STATUS" = "healthy" ] && [ "$NEWS_STATUS" = "healthy" ]; then
        print_step "Gateway, StockService, NewsService are healthy ✅"
        break
    fi
    RETRIES=$((RETRIES + 1))
    echo -ne "\r  Core services: gateway=$GW_STATUS stock=$STOCK_STATUS news=$NEWS_STATUS ($RETRIES/$MAX_RETRIES)"
    sleep 10
done
echo ""

# Start remaining services that depend on stockservice/newsservice
print_info "Starting dependent services (crawlservice, aiservice, aitoolsservice)..."
$COMPOSE_CMD up -d crawlservice aiservice aitoolsservice
echo ""

# Start frontend and monitoring
print_info "Starting frontend and monitoring..."
$COMPOSE_CMD up -d frontend prometheus alertmanager grafana watchtower
echo ""

# ============================================================================
# Step 9: Wait for all services to be ready
# ============================================================================
print_info "Waiting for all services to stabilize..."
sleep 30

# ============================================================================
# Step 10: Show final status
# ============================================================================
print_header "📊 Service Status"
$COMPOSE_CMD ps
echo ""

# Count healthy/running services
TOTAL=$(docker ps --format '{{.Names}}' | wc -l)
HEALTHY=$(docker ps --filter "health=healthy" --format '{{.Names}}' | wc -l)
RUNNING=$(docker ps --filter "status=running" --format '{{.Names}}' | wc -l)

echo ""
print_header "✅ FinS Server Started!"
echo ""
echo -e "  ${GREEN}Running:${NC}  $RUNNING containers"
echo -e "  ${GREEN}Healthy:${NC}  $HEALTHY containers"
echo ""
echo -e "  ${CYAN}Access Points:${NC}"
echo -e "    Gateway:     http://localhost:8080"
echo -e "    Frontend:    http://localhost:2302"
echo -e "    Consul UI:   http://localhost:8500"
echo -e "    Grafana:     http://localhost:3000"
echo -e "    Prometheus:  http://localhost:9090"
echo ""
echo -e "  ${YELLOW}Commands:${NC}"
echo -e "    View logs:   cd $COMPOSE_DIR && $COMPOSE_CMD logs -f"
echo -e "    Stop all:    cd $COMPOSE_DIR && $COMPOSE_CMD down"
echo -e "    Restart:     bash /mnt/d/HOC_DAI/DATN2025/FinS/scripts/start-server.sh"
echo ""

# ============================================================================
# Check for any failed services
# ============================================================================
FAILED=$(docker ps --filter "status=exited" --filter "status=restarting" --format '{{.Names}}' 2>/dev/null)
if [ -n "$FAILED" ]; then
    print_warn "Some services may have issues:"
    for svc in $FAILED; do
        STATUS=$(docker inspect --format='{{.State.Status}}' "$svc" 2>/dev/null)
        print_warn "  $svc: $STATUS"
    done
    echo ""
    print_info "Check logs: docker logs <service-name>"
fi
