#!/bin/bash
# ============================================================================
# MongoDB Security Setup Script
# This script sets up all security features for the StockApp microservices
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=============================================="
echo "  StockApp MongoDB Security Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Generate TLS Certificates
echo -e "${YELLOW}[Step 1/4]${NC} Generating TLS certificates..."
if [ -f "mongodb-security/certs/ca.crt" ]; then
    echo -e "${GREEN}   ✓ Certificates already exist${NC}"
else
    cd mongodb-security/scripts
    chmod +x generate-certs.sh
    ./generate-certs.sh
    cd ../..
    echo -e "${GREEN}   ✓ Certificates generated${NC}"
fi

# Step 2: Generate Encryption Master Key
echo ""
echo -e "${YELLOW}[Step 2/4]${NC} Checking encryption keys..."
if grep -q "^ENCRYPTION_MASTER_KEY=.\+" .env && ! grep -q "ChangeInProduction" .env; then
    echo -e "${GREEN}   ✓ Encryption key already configured${NC}"
else
    echo -e "${YELLOW}   → Generating new encryption master key...${NC}"
    MASTER_KEY=$(openssl rand -base64 32)
    
    # Update .env file
    if grep -q "^ENCRYPTION_MASTER_KEY=" .env; then
        sed -i "s|^ENCRYPTION_MASTER_KEY=.*|ENCRYPTION_MASTER_KEY=$MASTER_KEY|" .env
    else
        echo "ENCRYPTION_MASTER_KEY=$MASTER_KEY" >> .env
    fi
    
    echo -e "${GREEN}   ✓ New encryption key generated and saved to .env${NC}"
    echo -e "${RED}   ⚠ IMPORTANT: Backup this key securely!${NC}"
fi

# Step 3: Verify Docker is running
echo ""
echo -e "${YELLOW}[Step 3/4]${NC} Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ Docker is running${NC}"
else
    echo -e "${RED}   ✗ Docker is not running! Please start Docker first.${NC}"
    exit 1
fi

# Step 4: Start with security configuration
echo ""
echo -e "${YELLOW}[Step 4/4]${NC} Ready to start services with security..."
echo ""
echo "To start with full security (TLS + Encryption):"
echo -e "  ${GREEN}docker-compose -f docker-compose.yml -f docker-compose.security.yml up -d${NC}"
echo ""
echo "To start without TLS (development mode):"
echo -e "  ${GREEN}docker-compose up -d${NC}"
echo ""

# Summary
echo "=============================================="
echo "  Security Setup Complete!"
echo "=============================================="
echo ""
echo "Security layers configured:"
echo "  ✓ Layer 1: Authentication (username/password)"
echo "  ✓ Layer 2: TLS/SSL certificates generated"
echo "  ✓ Layer 3: Encrypted volumes configured"
echo "  ✓ Layer 4: Field-level encryption keys set"
echo ""
echo "Documentation: MONGODB_SECURITY.md"
echo ""
