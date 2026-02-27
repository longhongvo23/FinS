#!/bin/bash
# ============================================================================
# FinS - One-Click Server Startup Script (Ubuntu / WSL2)
# Khởi động toàn bộ hệ thống FinS với bảo mật 4 lớp
#
# Usage:
#   Ubuntu native: bash ~/FinS/scripts/start-server.sh
#   WSL2:          bash /mnt/d/HOC_DAI/DATN2025/FinS/scripts/start-server.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Auto-detect project root (relative to this script's location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_DIR="$PROJECT_ROOT/microservices/docker-compose"
CERT_DIR="$COMPOSE_DIR/mongodb-security/certs"
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
print_header "🚀 FinS Server Startup (4-Layer Security)"

print_info "Checking Docker..."
if docker info > /dev/null 2>&1; then
    print_step "Docker is running"
else
    print_info "Docker not responding, trying to start..."
    # Try systemctl first (native Ubuntu), then service (WSL)
    if command -v systemctl &> /dev/null && systemctl is-enabled docker &> /dev/null; then
        sudo systemctl start docker 2>/dev/null || true
    else
        sudo service docker start 2>/dev/null || true
    fi
    sleep 5
    if docker info > /dev/null 2>&1; then
        print_step "Docker started successfully"
    else
        print_error "Docker failed to start."
        print_info "Ubuntu native:  sudo systemctl start docker"
        print_info "WSL2:           sudo service docker start  (or start Docker Desktop)"
        exit 1
    fi
fi

# ============================================================================
# Step 2: Navigate to compose directory
# ============================================================================
cd "$COMPOSE_DIR"
print_step "Working directory: $COMPOSE_DIR"

# ============================================================================
# Step 3: Check & Create prerequisites
# ============================================================================
print_info "Checking prerequisites..."

# Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warn ".env file not found! Copying from .env.example..."
        cp .env.example .env
        print_warn "⚠️  Please edit .env and fill in your actual API keys & secrets!"
        print_warn "   Run: nano $COMPOSE_DIR/.env"
        exit 1
    else
        print_error ".env file not found and no .env.example available!"
        exit 1
    fi
fi
print_step ".env file found"

# ============================================================================
# Step 3b: Auto-generate TLS certificates if missing
# ============================================================================
if [ ! -f "$CERT_DIR/ca.crt" ] || [ ! -f "$CERT_DIR/gateway-mongodb.pem" ]; then
    print_warn "TLS certificates not found. Auto-generating..."
    mkdir -p "$CERT_DIR"
    cd "$CERT_DIR"

    DAYS=3650
    SUBJ="/C=VN/ST=HoChiMinh/L=HoChiMinh/O=StockApp/OU=Security"
    SERVICES="gateway userservice notificationservice stockservice newsservice crawlservice aitoolsservice"

    # Check openssl
    if ! command -v openssl &> /dev/null; then
        print_error "openssl not found. Install it: sudo apt-get install -y openssl"
        exit 1
    fi

    print_info "Generating CA certificate..."
    openssl genrsa -out ca.key 4096 2>/dev/null
    openssl req -x509 -new -nodes -key ca.key -sha256 -days $DAYS -out ca.crt \
        -subj "$SUBJ/CN=StockApp-MongoDB-CA" 2>/dev/null

    for SERVICE in $SERVICES; do
        HOST="${SERVICE}-mongodb"
        print_info "  Generating cert for $HOST..."
        openssl genrsa -out ${HOST}.key 2048 2>/dev/null
        openssl req -new -key ${HOST}.key -out ${HOST}.csr \
            -subj "$SUBJ/CN=$HOST" 2>/dev/null

        cat > ${HOST}.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature,nonRepudiation,keyEncipherment,dataEncipherment
subjectAltName=@alt_names
[alt_names]
DNS.1=$HOST
DNS.2=localhost
DNS.3=mongodb
IP.1=127.0.0.1
EOF

        openssl x509 -req -in ${HOST}.csr -CA ca.crt -CAkey ca.key \
            -CAcreateserial -out ${HOST}.crt -days $DAYS -sha256 \
            -extfile ${HOST}.ext 2>/dev/null
        cat ${HOST}.key ${HOST}.crt > ${HOST}.pem
        chmod 600 ${HOST}.pem
        rm -f ${HOST}.csr ${HOST}.ext
    done

    # Java truststore
    openssl pkcs12 -export -in ca.crt -nokeys -out truststore.p12 \
        -passout pass:changeit -name mongodb-ca 2>/dev/null
    cat ca.crt > ca-bundle.pem

    cd "$COMPOSE_DIR"
    print_step "TLS certificates generated successfully ✅"
else
    print_step "TLS certificates found"
fi

# Check GHCR images availability
print_info "Checking Docker images..."
LOCAL_IMAGES=$(docker images --format '{{.Repository}}' | grep "fins-" | wc -l 2>/dev/null || echo "0")
if [ "$LOCAL_IMAGES" -gt 0 ]; then
    print_step "Found $LOCAL_IMAGES local FinS images"
else
    print_warn "No local FinS images found. Will try to pull from GHCR..."
fi

# ============================================================================
# Step 4: Stop old containers (if any)
# ============================================================================
print_info "Stopping old containers (if any)..."
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true
print_step "Old containers cleaned up"

# ============================================================================
# Step 5: Pull latest images (optional, skip if local build)
# ============================================================================
print_info "Pulling latest images..."
$COMPOSE_CMD pull 2>/dev/null || print_warn "Some images failed to pull, using cached/local versions"
print_step "Images ready"

# ============================================================================
# Step 6: Start all services
# ============================================================================
print_header "🔒 Starting with 4-Layer Security"
echo -e "  ${GREEN}Layer 1:${NC} Authentication (MongoDB users + JWT)"
echo -e "  ${GREEN}Layer 2:${NC} TLS/SSL encryption (MongoDB traffic)"
echo -e "  ${GREEN}Layer 3:${NC} Field-level encryption (@Encrypted + MASTER_KEY)"
echo -e "  ${GREEN}Layer 4:${NC} Volume encryption (Docker named volume)"
echo ""

# NOTE: Kafka uses KRaft mode (no Zookeeper needed)
print_info "Starting infrastructure services first..."
$COMPOSE_CMD up -d mongodb consul consul-config-loader kafka redis
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
        if [ $RETRIES -gt 0 ] && [ $(( RETRIES % 5 )) -eq 0 ]; then
            print_warn "MongoDB unhealthy, checking logs..."
            docker logs mongodb 2>&1 | tail -5
            print_info "Restarting MongoDB..."
            docker restart mongodb
            sleep 10
        fi
    fi
    RETRIES=$((RETRIES + 1))
    printf "\r  Waiting for MongoDB... (%d/%d) - Status: %-12s" "$RETRIES" "$MAX_RETRIES" "$STATUS"
    sleep 5
done
echo ""

if [ "$STATUS" != "healthy" ]; then
    print_error "MongoDB failed to become healthy after $MAX_RETRIES attempts."
    print_error "Last 20 lines of MongoDB logs:"
    docker logs mongodb 2>&1 | tail -20
    echo ""
    print_info "Troubleshooting tips:"
    print_info "  1. Check if MONGODB_ROOT_PASSWORD in .env matches existing data"
    print_info "  2. To reset: docker volume rm fins_mongodb_data (⚠️ DATA LOSS)"
    print_info "  3. Check TLS certs: ls -la $CERT_DIR/"
    exit 1
fi

# Wait for Consul
print_info "Waiting for Consul..."
RETRIES=0
while [ $RETRIES -lt 12 ]; do
    if curl -sf http://localhost:8500/v1/status/leader > /dev/null 2>&1; then
        print_step "Consul is ready ✅"
        break
    fi
    RETRIES=$((RETRIES + 1))
    sleep 5
done

# ============================================================================
# Step 8: Start application services
# ============================================================================
print_info "Starting application services..."
$COMPOSE_CMD up -d gateway userservice stockservice newsservice notificationservice
echo ""

# Wait for core services
print_info "Waiting for core services to become healthy..."
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    GW_STATUS=$(docker inspect --format='{{.State.Health.Status}}' gateway 2>/dev/null || echo "starting")
    STOCK_STATUS=$(docker inspect --format='{{.State.Health.Status}}' stockservice 2>/dev/null || echo "starting")
    NEWS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' newsservice 2>/dev/null || echo "starting")

    if [ "$GW_STATUS" = "healthy" ] && [ "$STOCK_STATUS" = "healthy" ] && [ "$NEWS_STATUS" = "healthy" ]; then
        print_step "Gateway, StockService, NewsService are healthy ✅"
        break
    fi
    RETRIES=$((RETRIES + 1))
    printf "\r  gateway=%-12s stock=%-12s news=%-12s (%d/%d)" "$GW_STATUS" "$STOCK_STATUS" "$NEWS_STATUS" "$RETRIES" "$MAX_RETRIES"
    sleep 10
done
echo ""

if [ $RETRIES -eq $MAX_RETRIES ]; then
    print_warn "Some core services did not become healthy in time. Continuing anyway..."
    print_info "Check: $COMPOSE_CMD logs gateway stockservice newsservice"
fi

# Start dependent services
print_info "Starting dependent services (crawlservice, aiservice, aitoolsservice)..."
$COMPOSE_CMD up -d crawlservice aiservice aitoolsservice
echo ""

# Start frontend, monitoring, and remote access (Ngrok + Nginx Proxy)
print_info "Starting frontend, monitoring and remote access..."
$COMPOSE_CMD up -d frontend prometheus alertmanager grafana watchtower nginx-proxy ngrok
echo ""

# ============================================================================
# Step 9: Wait for all services to stabilize
# ============================================================================
print_info "Waiting for all services to stabilize (30s)..."
sleep 30

# ============================================================================
# Step 10: Show final status
# ============================================================================
print_header "📊 Service Status"
$COMPOSE_CMD ps
echo ""

# Count services
TOTAL=$(docker ps --format '{{.Names}}' | wc -l)
HEALTHY=$(docker ps --filter "health=healthy" --format '{{.Names}}' | wc -l)
RUNNING=$(docker ps --filter "status=running" --format '{{.Names}}' | wc -l)

print_header "✅ FinS Server Started!"
echo ""
echo -e "  ${GREEN}Running:${NC}  $RUNNING containers"
echo -e "  ${GREEN}Healthy:${NC}  $HEALTHY containers"
echo ""
echo -e "  ${CYAN}Access Points:${NC}"
echo -e "    Gateway:     http://localhost:8080"
echo -e "    Frontend:    http://localhost:2302"
echo -e "    Consul UI:   http://localhost:8500"
echo -e "    Grafana:     http://localhost:3000  (admin/admin)"
echo -e "    Prometheus:  http://localhost:9090"
echo ""
print_info "Fetching Ngrok public URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.dev' | head -n 1)
if [ -n "$NGROK_URL" ]; then
    echo -e "  ${CYAN}Public Access (Ngrok):${NC}"
    echo -e "    URL:         ${GREEN}$NGROK_URL${NC}"
else
    print_warn "Could not fetch Ngrok URL. Is NGROK_AUTHTOKEN set in .env?"
    print_info "Check Ngrok status: http://localhost:4040"
fi
echo ""
echo -e "  ${YELLOW}Commands:${NC}"
echo -e "    View logs:   cd $COMPOSE_DIR && $COMPOSE_CMD logs -f"
echo -e "    Stop all:    cd $COMPOSE_DIR && $COMPOSE_CMD down"
echo -e "    Restart:     bash $SCRIPT_DIR/start-server.sh"
echo ""

# ============================================================================
# Check for any failed services
# ============================================================================
FAILED=$(docker ps --filter "status=exited" --filter "status=restarting" --format '{{.Names}}' 2>/dev/null)
if [ -n "$FAILED" ]; then
    print_warn "Some services may have issues:"
    for svc in $FAILED; do
        SVC_STATUS=$(docker inspect --format='{{.State.Status}}' "$svc" 2>/dev/null)
        print_warn "  $svc: $SVC_STATUS"
    done
    echo ""
    print_info "Check logs: docker logs <service-name>"
fi
