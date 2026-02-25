# 🌐 Hướng dẫn triển khai FinS với Ngrok

## 📋 Tổng quan kiến trúc

Hệ thống FinS hiện tại đã được cấu hình để hoạt động với **Ngrok** hoặc bất kỳ reverse proxy nào:

```
Internet (Ngrok URL)
    ↓
Ngrok Tunnel
    ↓
nginx (port 4000) ← scripts/nginx-ngrok.conf
    ↓
├── / → frontend:2302 (nginx inside container)
│   └── /services/* → gateway:8080 (proxied by container nginx)
├── /gateway/* → gateway:8080 (admin UI)
└── /management/* → gateway:8080 (health checks)
```

## ✅ Cách chạy hiện tại (ĐÚNG)

### Bước 1: Khởi động server
```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS
bash scripts/start-server.sh
```

Script này sẽ:
- ✅ Start Docker
- ✅ Generate TLS certificates
- ✅ Pull Docker images từ GHCR
- ✅ Start tất cả services với docker-compose

### Bước 2: Chạy Ngrok

**Cách 1: Qua nginx proxy (Port 4000) - KHUYÊN DÙNG**
```bash
# Terminal 1: Start nginx proxy
bash scripts/start-ngrok.sh
```

Script này sẽ:
- Start nginx trên port 4000
- Proxy traffic từ port 4000 tới frontend (2302) và gateway (8080)
- Start ngrok tunnel tới port 4000

**Cách 2: Trực tiếp tới frontend (Port 80)**
```bash
# Nếu muốn ngrok trực tiếp
ngrok http 80
```

> ⚠️ **Lưu ý:** Với cách 2, bạn cần expose port 80 trong docker-compose (đã cấu hình).

## 🐛 Vấn đề cũ và cách fix

### ❌ Vấn đề: Bạn bè không đăng nhập được

**Nguyên nhân:** 
- File `.env.production` hardcode IP LAN: `VITE_API_URL=http://192.168.1.218:8080`
- Khi build frontend, code JavaScript được compile với URL cố định này
- Khi bạn bè truy cập qua ngrok, frontend vẫn cố gọi API tới `192.168.1.218` (không accessible từ internet)

**Giải pháp đã áp dụng:**
```env
# File: client/smarttrade-web/.env.production
VITE_API_URL=
VITE_AI_SERVICE_URL=
```

✅ Giờ frontend sẽ:
- Gọi API qua relative path: `/services/userservice/api/...`
- Nginx trong container frontend sẽ proxy tới `gateway:8080`
- Hoạt động với mọi domain (localhost, ngrok, cloudflare)

## 🔄 Sau khi sửa code

### Rebuild frontend image
```bash
cd client/smarttrade-web
npm run build

# Build Docker image
docker build -t ghcr.io/longhongvo23/fins-frontend:latest .

# Hoặc push code lên GitHub, workflow tự build và deploy
```

### Hoặc đợi CI/CD tự động
Khi push code lên GitHub:
1. Workflow `.github/workflows/devsecops-pipeline.yml` chạy
2. Build Docker images mới
3. Push lên GHCR
4. Self-hosted runner tự động pull và deploy

## 🌐 URL cố định (Static Domain)

### Vấn đề: Ngrok free tạo URL random mỗi lần

Mỗi lần chạy `ngrok http 4000`:
- Lần 1: `https://abc123.ngrok-free.app`
- Lần 2: `https://xyz789.ngrok-free.app` ← Khác!

### Giải pháp 1: Ngrok Paid Plan ($8-10/tháng)
```bash
ngrok http --domain=fins-app.ngrok-free.app 4000
```

### Giải pháp 2: Cloudflare Tunnel (MIỄN PHÍ - KHUYÊN DÙNG)

**Yêu cầu:** Domain riêng (~$1-2/năm)

```bash
# 1. Cài Cloudflare Tunnel
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# 2. Login
cloudflared tunnel login

# 3. Tạo tunnel
cloudflared tunnel create fins

# 4. Tạo config (xem mẫu: scripts/cloudflare-tunnel-config.example.yml)
nano ~/.cloudflared/config.yml
```

**Config mẫu:**
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USERNAME/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: fins.yourdomain.com
    service: http://localhost:4000  # Nginx proxy
  - service: http_status:404
```

```bash
# 5. Chạy tunnel
cloudflared tunnel run fins
```

**Ưu điểm Cloudflare Tunnel:**
- ✅ Miễn phí hoàn toàn
- ✅ Domain cố định (fins.yourdomain.com)
- ✅ HTTPS tự động
- ✅ DDoS protection
- ✅ Traffic qua CDN của Cloudflare

## 📝 Kiểm tra hệ thống

### Kiểm tra services đang chạy
```bash
cd microservices/docker-compose
docker compose ps
```

### Kiểm tra health
```bash
# Gateway
curl http://localhost:8080/management/health

# Frontend
curl http://localhost:2302/health

# All services
bash scripts/start-server.sh  # Check output
```

### Xem logs
```bash
cd microservices/docker-compose

# Tất cả services
docker compose logs -f

# Một service cụ thể
docker compose logs -f gateway
docker compose logs -f frontend
```

## 🚀 Quy trình deploy production

### Phát triển local
1. Code trên máy local
2. Test với `npm run dev` hoặc `docker compose up`
3. Commit code

### Deploy tự động
```bash
git add .
git commit -m "feat: update frontend config for ngrok"
git push origin main
```

GitHub Actions sẽ:
1. ✅ Run security scans (secret detection, SAST, dependency scan)
2. ✅ Build all services
3. ✅ Run tests
4. ✅ Build & push Docker images to GHCR
5. ✅ Self-hosted runner tự động pull images mới
6. ✅ Generate TLS certificates
7. ✅ Deploy với docker-compose
8. ✅ Health check

### Verify deployment
```bash
# Trên server
docker ps  # Xem containers

# Test local
curl http://localhost:8080/management/health
curl http://localhost:2302/

# Test qua ngrok
bash scripts/start-ngrok.sh
# Mở URL ngrok trong browser
```

## 🔧 Troubleshooting

### Frontend không gọi được API
```bash
# Check nginx trong frontend container
docker exec -it frontend cat /etc/nginx/nginx.conf

# Check logs
docker logs frontend
```

### Ngrok không kết nối
```bash
# Check ngrok auth token
ngrok config check

# Add token
ngrok config add-authtoken YOUR_TOKEN
```

### Services không healthy
```bash
# Restart specific service
cd microservices/docker-compose
docker compose restart gateway

# Rebuild and restart
docker compose up -d --build gateway
```

## 📚 Tài liệu liên quan

- [Ngrok Docs](https://ngrok.com/docs)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [DevSecOps Pipeline](.github/workflows/devsecops-pipeline.yml)
- [Start Server Script](scripts/start-server.sh)
- [Nginx Config](scripts/nginx-ngrok.conf)

## 🎯 Kết luận

Hệ thống đã được cấu hình để:
- ✅ Hoạt động với bất kỳ domain nào (localhost, LAN IP, ngrok, cloudflare)
- ✅ Frontend dùng relative path → không bị hardcode IP
- ✅ Nginx proxy traffic đúng cách
- ✅ CI/CD tự động build và deploy
- ✅ Sẵn sàng cho production

**Khuyến nghị:**
- Dùng **Cloudflare Tunnel** nếu muốn domain cố định miễn phí
- Dùng **Ngrok paid** nếu cần nhanh và đơn giản
- Khi có nhiều users, nâng cấp lên VPS/Cloud (AWS, GCP, Azure) với domain thật
