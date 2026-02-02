#!/bin/bash
# ============================================================================
# FinS WSL2 Server Setup Script
# Tự động setup Docker + MongoDB Security + Cloudflare Tunnel
# ============================================================================

set -e

echo "🚀 FinS WSL2 Server Setup Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Step 1: Update System
# ============================================================================
print_step "1/6 - Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ============================================================================
# Step 2: Install Docker Engine
# ============================================================================
print_step "2/6 - Installing Docker Engine..."

# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

print_step "Docker installed successfully!"

# ============================================================================
# Step 3: Install Additional Tools
# ============================================================================
print_step "3/6 - Installing additional tools..."
sudo apt install -y git curl wget jq unzip openssl

# ============================================================================
# Step 4: Install Cloudflared
# ============================================================================
print_step "4/6 - Installing Cloudflare Tunnel..."

# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/cloudflared

cloudflared --version
print_step "Cloudflared installed successfully!"

# ============================================================================
# Step 5: Setup Project Directory
# ============================================================================
print_step "5/6 - Setting up project directory..."

PROJECT_DIR="$HOME/FinS"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "Cloning FinS repository..."
    git clone https://github.com/longhongvo23/FinS.git "$PROJECT_DIR"
else
    echo "FinS directory already exists, pulling latest..."
    cd "$PROJECT_DIR" && git pull
fi

# ============================================================================
# Step 6: Generate MongoDB TLS Certificates
# ============================================================================
print_step "6/6 - Generating MongoDB TLS certificates..."

cd "$PROJECT_DIR/microservices/docker-compose/mongodb-security/scripts"

if [ -f "generate-certs.sh" ]; then
    chmod +x generate-certs.sh
    ./generate-certs.sh
    print_step "TLS certificates generated!"
else
    print_warning "Certificate generation script not found. Will create manually."
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ WSL2 Server Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Close this terminal and open a new one (for docker group to take effect)"
echo "2. Run: cd ~/FinS/microservices/docker-compose"
echo "3. Run: docker compose up -d"
echo "4. Setup Cloudflare Tunnel (see below)"
echo ""
echo "To setup Cloudflare Tunnel:"
echo "  cloudflared tunnel login"
echo "  cloudflared tunnel create fins"
echo "  (Follow the instructions to configure)"
echo ""
echo "Project location: $PROJECT_DIR"
echo ""
