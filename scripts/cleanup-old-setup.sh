#!/bin/bash
# ============================================================================
# Cleanup Script - Remove old nginx system and ngrok manual setup
# Run this ONCE to clean up the old configuration
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FinS System Cleanup - Remove Old Setup    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Step 1: Stop nginx system service
# ============================================================================
echo -e "${YELLOW}[1/4]${NC} Stopping nginx system service..."
if command -v nginx &>/dev/null; then
    sudo nginx -s stop 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Nginx system stopped"
else
    echo -e "${BLUE}→${NC} Nginx system not installed (OK)"
fi

# ============================================================================
# Step 2: Remove nginx configs
# ============================================================================
echo -e "${YELLOW}[2/4]${NC} Removing old nginx configs..."
if [ -f "/etc/nginx/sites-enabled/fins-proxy.conf" ]; then
    sudo rm -f /etc/nginx/sites-enabled/fins-proxy.conf
    echo -e "${GREEN}✓${NC} Removed /etc/nginx/sites-enabled/fins-proxy.conf"
fi
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo -e "${BLUE}→${NC} Kept default nginx config"
fi

# ============================================================================
# Step 3: Stop any running ngrok processes
# ============================================================================
echo -e "${YELLOW}[3/4]${NC} Stopping manual ngrok processes..."
pkill -f "ngrok http" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Stopped ngrok processes"

# ============================================================================
# Step 4: Stop old docker containers
# ============================================================================
echo -e "${YELLOW}[4/4]${NC} Stopping old docker containers..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_DIR="$PROJECT_ROOT/microservices/docker-compose"

if [ -f "$COMPOSE_DIR/docker-compose.yml" ]; then
    cd "$COMPOSE_DIR"
    docker compose down --remove-orphans 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Docker containers stopped"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ Cleanup Complete!                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Add NGROK_AUTHTOKEN to .env file:"
echo -e "     ${YELLOW}nano $COMPOSE_DIR/.env${NC}"
echo -e "     ${YELLOW}NGROK_AUTHTOKEN=your_token_here${NC}"
echo -e ""
echo -e "  2. Get your ngrok token from:"
echo -e "     ${BLUE}https://dashboard.ngrok.com/get-started/your-authtoken${NC}"
echo -e ""
echo -e "  3. Start the new containerized system:"
echo -e "     ${YELLOW}bash $SCRIPT_DIR/start-server.sh${NC}"
echo -e ""
echo -e "  4. Access ngrok Web UI:"
echo -e "     ${BLUE}http://localhost:4040${NC}"
echo -e ""
echo -e "${GREEN}The system is now fully containerized!${NC}"
echo -e "  • nginx-proxy runs in container (port 4000)"
echo -e "  • ngrok runs in container (auto-tunnel)"
echo -e "  • No more manual start-ngrok.sh needed!"
echo ""
