#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  start-ngrok.sh  –  Khởi động Nginx proxy + Ngrok tunnel
#  Mở cả FE (2302) và Backend/Admin (8080) qua 1 ngrok tunnel
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/nginx-ngrok.conf"
NGINX_PORT=4000

echo "╔═══════════════════════════════════════════════╗"
echo "║   FinS – Ngrok + Nginx Reverse Proxy Setup    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ── 1. Kiểm tra Nginx ──
if ! command -v nginx &>/dev/null; then
    echo "📦 Cài đặt Nginx..."
    sudo apt-get update -qq && sudo apt-get install -y -qq nginx > /dev/null 2>&1
    echo "✅ Nginx đã cài xong"
fi

# ── 2. Kiểm tra Ngrok ──
if ! command -v ngrok &>/dev/null; then
    echo "❌ Ngrok chưa được cài đặt!"
    echo "   Cài bằng lệnh:"
    echo "   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | sudo tar xz -C /usr/local/bin"
    echo "   ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

# ── 3. Dừng Nginx cũ (nếu đang chạy) ──
echo "🔄 Dừng Nginx cũ (nếu có)..."
sudo nginx -s stop 2>/dev/null || true
sleep 1

# ── 4. Copy config và khởi động Nginx ──
echo "📝 Copy Nginx config..."
sudo cp "$NGINX_CONF" /etc/nginx/sites-enabled/fins-proxy.conf
# Xóa default site để tránh conflict port 80
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
echo "🔍 Kiểm tra Nginx config..."
sudo nginx -t

echo "🚀 Khởi động Nginx trên port $NGINX_PORT..."
sudo nginx
echo "✅ Nginx đang chạy trên port $NGINX_PORT"
echo ""

# ── 5. Kiểm tra services đang chạy ──
echo "🔍 Kiểm tra services..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:2302 | grep -q "200"; then
    echo "   ✅ Frontend  (port 2302) – OK"
else
    echo "   ⚠️  Frontend  (port 2302) – Không phản hồi"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/management/health | grep -q "200"; then
    echo "   ✅ Gateway   (port 8080) – OK"
else
    echo "   ⚠️  Gateway   (port 8080) – Không phản hồi"
fi
echo ""

# ── 6. Khởi động Ngrok ──
echo "╔═══════════════════════════════════════════════╗"
echo "║          Khởi động Ngrok Tunnel...            ║"
echo "║                                               ║"
echo "║  Routing:                                     ║"
echo "║    /              → Frontend  (port 2302)     ║"
echo "║    /services/*    → Gateway   (port 8080)     ║"
echo "║    /gateway/*     → Gateway Admin UI          ║"
echo "║    /management/*  → Actuator Health           ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "💡 TIP: Để có domain cố định mỗi lần chạy:"
echo "   - Dùng ngrok paid plan: ngrok http --domain=your-domain.ngrok-free.app $NGINX_PORT"
echo "   - HOẶC dùng Cloudflare Tunnel (miễn phí): xem scripts/cloudflare-tunnel-config.example.yml"
echo ""

ngrok http $NGINX_PORT
