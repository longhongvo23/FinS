# 🌐 Hướng dẫn triển khai FinS với Ngrok (Containerized)

## 📋 Tổng quan kiến trúc MỚI

Hệ thống đã được **containerize hoàn toàn**, không cần chạy script thủ công nữa:

```
Internet
    ↓
Ngrok Container (auto-tunnel, Web UI: 4040)
    ↓
Nginx-Proxy Container (port 4000)
    ↓
├── / → Frontend Container (port 80)
│   └── /services/* → Gateway:8080 (proxied by frontend nginx)
├── /gateway/* → Gateway:8080 (admin UI)
└── /management/* → Gateway:8080 (health checks)
```

**✨ Ưu điểm:**
- ✅ Tất cả chạy trong docker-compose
- ✅ Workflow tự động deploy ngrok
- ✅ Không cần chạy script thủ công
- ✅ Ngrok Web UI để xem URL: `http://localhost:4040`
- ✅ Tự động restart khi có lỗi

## 🚀 Cách sử dụng MỚI (Cực đơn giản)

### Lần đầu tiên: Setup

#### Bước 1: Dọn dẹp cấu hình cũ (nếu có)
```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS
bash scripts/cleanup-old-setup.sh
```

Script này sẽ:
- Stop nginx system service
- Remove old configs
- Stop manual ngrok processes
- Clean docker containers

#### Bước 2: Thêm NGROK_AUTHTOKEN vào .env
```bash
# Edit file .env
nano microservices/docker-compose/.env

# Thêm dòng này (lấy token từ https://dashboard.ngrok.com)
NGROK_AUTHTOKEN=your_ngrok_token_here
```

#### Bước 3: Khởi động tất cả
```bash
bash scripts/start-server.sh
```

**Xong!** Tất cả services bao gồm ngrok đã chạy tự động.

### Xem Ngrok URL

**Cách 1: Web UI (Đơn giản nhất)**
```
http://localhost:4040
```

**Cách 2: Script tự động**
```bash
# Windows
scripts\get-ngrok-url.bat

# Linux/Mac
bash scripts/get-ngrok-url.sh
```

**Cách 3: API**
```bash
curl http://localhost:4040/api/tunnels
```

⚠️ **Lưu ý quan trọng về Free URLs:**
- Free ngrok URLs thay đổi mỗi khi restart container
- URL có dạng: `https://xxxx-xxx-xxx-xxx-xxx.ngrok-free.app`
- Để có URL cố định, xem phần "Static Domains" bên dưới

**Tất cả đã tự động!** Không cần chạy `start-ngrok.sh` nữa!

## � Static Domains (URL Cố định)

### Vấn đề với Free URLs

Free ngrok URLs thay đổi mỗi khi restart:
- Restart container → URL mới
- Server reboot → URL mới
- Không thể share URL cố định cho bạn bè

### Giải pháp: Ngrok Static Domains

**Option 1: Ngrok Paid Plan** ($10/month)
1. Upgrade tài khoản: https://dashboard.ngrok.com/billing
2. Tạo static domain: https://dashboard.ngrok.com/domains
3. Update docker-compose.yml:

```yaml
ngrok:
  image: ngrok/ngrok:latest
  command: ["http", "--domain=your-domain.ngrok.app", "nginx-proxy:4000"]
  environment:
    - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
```

**Option 2: Cloudflare Tunnel** (Free)
- Tương tự ngrok nhưng miễn phí
- Setup: See `scripts/cloudflare-tunnel-config.example.yml`

**Option 3: VPS + Reverse SSH Tunnel** (Free nếu có VPS)
```bash
# From WSL to VPS
ssh -R 4000:localhost:4000 user@your-vps.com
```

Recommendation: Nếu dùng production, nên dùng Cloudflare Tunnel hoặc VPS riêng.

## �🔄 Workflow tự động hoàn toàn

### Khi bạn sửa code và push

```bash  
git add .
git commit -m "feat: update something"
git push origin main
```

**GitHub Actions tự động:**
1. ✅ Security scans
2. ✅ Build all Docker images
3. ✅ Push to GHCR
4. ✅ Self-hosted runner deploy
5. ✅ Pull new images
6. ✅ Restart ALL containers (including nginx-proxy and ngrok)
7. ✅ Health checks

**Bạn KHÔNG CẦN làm gì!** Ngrok tự động restart và tạo tunnel mới.

## 🎯 So sánh: Cũ vs Mới

| Tiêu chí | Cũ (Thủ công) | Mới (Containerized) |
|----------|---------------|---------------------|
| **Start server** | `bash start-server.sh` | `bash start-server.sh` |
| **Start ngrok** | `bash start-ngrok.sh` (riêng terminal) | ✅ Tự động trong docker-compose |
| **Khi deploy** | Phải restart ngrok thủ công | ✅ Tự động restart |
| **Port conflict** | Dễ xảy ra (80, 4000) | ✅ Không xung đột |
| **Ngrok URL** | Phải xem trong terminal | ✅ Web UI: localhost:4040 |
| **Monitoring** | Khó | ✅ Dễ (logs, health checks) |

## 📊 Kiểm tra hệ thống

### Xem tất cả containers
```bash
cd microservices/docker-compose
docker compose ps
```

Bạn sẽ thấy:
- ✅ `nginx-proxy` - Public entry point
- ✅ `ngrok` - Internet tunnel
- ✅ `frontend` - React app
- ✅ `gateway` - API gateway
- ✅ Tất cả microservices khác

### Xem logs
```bash
# Ngrok logs (để xem URL)
docker logs ngrok

# Nginx-proxy logs
docker logs nginx-proxy

# Tất cả logs
docker compose logs -f
```

### Ngrok Web UI
```
http://localhost:4040
```

Ở đây bạn thấy:
- 🌐 Ngrok public URL
- 📊 Traffic statistics
- 🔍 Request/response inspector

## 🛠️ Troubleshooting MỚI

### Ngrok không có URL
```bash
# Check ngrok container
docker logs ngrok

# Thường do thiếu NGROK_AUTHTOKEN
nano microservices/docker-compose/.env
# Thêm: NGROK_AUTHTOKEN=your_token
```

### Restart ngrok để lấy URL mới
```bash
cd microservices/docker-compose
docker compose restart ngrok

# Xem URL mới
docker logs ngrok | grep "url="
```

### Services không healthy
```bash
# Restart all
docker compose restart

# Hoặc rebuild
docker compose up -d --build nginx-proxy
```

## 🐛 Vấn đề cũ đã được fix

### ❌ Vấn đề 1: Bạn bè không đăng nhập được
**Nguyên nhân:** Frontend hardcode IP LAN  
**Giải pháp:** ✅ Dùng relative path

### ❌ Vấn đề 2: Phải chạy ngrok thủ công
**Nguyên nhân:** Ngrok ở ngoài docker-compose  
**Giải pháp:** ✅ Containerize ngrok

### ❌ Vấn đề 3: Port conflict (80 bị chiếm)
**Nguyên nhân:** Nginx system vs container  
**Giải pháp:** ✅ Nginx-proxy container (port 4000)

### ❌ Vấn đề 4: Khi deploy phải restart ngrok
**Nguyên nhân:** Ngrok không trong docker-compose  
**Giải pháp:** ✅ Workflow tự động restart ngrok

## 🔐 GitHub Secrets cần thêm

Vào GitHub repo → Settings → Secrets → Add:

```
NGROK_AUTHTOKEN = your_ngrok_authtoken_here
```

Workflow sẽ tự động inject vào container.

## 📚 Files đã thay đổi

| File | Thay đổi |
|------|----------|
| `docker-compose.yml` | + nginx-proxy container, + ngrok container |
| `nginx-proxy.conf` | Config mới cho containerized nginx |
| `.env` | + NGROK_AUTHTOKEN |
| `.github/workflows/devsecops-pipeline.yml` | + NGROK_AUTHTOKEN injection |
| `scripts/cleanup-old-setup.sh` | Script dọn dẹp cấu hình cũ |
| `NGROK_SETUP.md` | Hướng dẫn mới |

## 🎯 Kết luận

**Hệ thống mới:**
- ✅ 100% containerized
- ✅ Zero manual intervention
- ✅ Auto-deploy với CI/CD
- ✅ Clean architecture
- ✅ Easy monitoring

**Bạn chỉ cần:**
1. Chạy `bash scripts/start-server.sh` lần đầu
2. Mọi lần sau chỉ push code, hệ thống tự cập nhật!

**Không còn:**
- ❌ `start-ngrok.sh` thủ công
- ❌ Nginx system service
- ❌ Port conflicts
- ❌ Manual restarts

**Khuyến nghị tiếp theo:**
- Nếu muốn domain cố định: Dùng **Cloudflare Tunnel** (miễn phí)
- Nếu muốn ngrok static domain: Upgrade ngrok paid ($8/tháng)
- Production: Deploy lên VPS/Cloud với domain thật

## 🔄 Sau khi sửa code

### Tự động hoàn toàn (Khuyên dùng)
```bash
git add .
git commit -m "feat: update feature"
git push origin main
```

GitHub Actions tự động:
1. Build Docker images mới
2. Push to GHCR
3. Self-hosted runner pull và deploy
4. Restart tất cả containers (bao gồm ngrok)

**Bạn không cần làm gì thêm!**

### Manual (nếu cần test local)
```bash
cd microservices/docker-compose

# Rebuild một service
docker compose up -d --build frontend

# Hoặc rebuild tất cả
docker compose up -d --build

# Ngrok tự động kết nối lại
```

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

**Ưu điểm hơn ngrok:**
- ✅ Miễn phí hoàn toàn
- ✅ Domain cố định (fins.yourdomain.com)
- ✅ HTTPS tự động
- ✅ DDoS protection
- ✅ Không giới hạn bandwidth

**Yêu cầu:** Domain riêng (~$1-2/năm từ Namecheap, Porkbun)

```bash
# 1. Cài Cloudflare Tunnel
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# 2. Login
cloudflared tunnel login

# 3. Tạo tunnel
cloudflared tunnel create fins

# 4. Config
nano ~/.cloudflared/config.yml
```

**Config:**
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USERNAME/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: fins.yourdomain.com
    service: http://localhost:4000  # Point to nginx-proxy
  - service: http_status:404
```

```bash
# 5. Run as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

> 💡 **Lưu ý:** Cloudflare Tunnel chạy **song song** với ngrok container. Bạn có thể dùng cả hai!

## 🔧 Advanced: Ngrok như một service (systemd)

Nếu muốn ngrok tự động start khi server reboot:

```bash
# Không cần! Docker compose đã có restart: unless-stopped
# Ngrok container tự động restart khi server reboot
```

Nhưng nếu muốn Cloudflare Tunnel tự động:
```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 📝 Kiểm tra hệ thống (Updated)

### Xem tất cả services
```bash
cd microservices/docker-compose
docker compose ps
```

### Xem ngrok URL
**Web UI (Khuyên dùng):**
```
http://localhost:4040
```

**Terminal:**
```bash
docker logs ngrok | grep "url="
# Hoặc
curl -s http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
```

### Health checks
```bash
# Gateway
curl http://localhost:8080/management/health

# Frontend (qua nginx-proxy)
curl http://localhost:4000/

# All services
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Xem logs
```bash
# Tất cả
docker compose logs -f

# Chỉ ngrok
docker logs -f ngrok

# Chỉ nginx-proxy
docker logs -f nginx-proxy

# Multiple services
docker compose logs -f ngrok nginx-proxy gateway frontend
```

## 🔧 Troubleshooting (Updated)

## 🚀 Quy trình deploy production

### Lần đầu tiên
1. Setup GitHub Secrets (NGROK_AUTHTOKEN + others)
2. Config self-hosted runner
3. Push code → Tự động deploy

### Mỗi lần sửa code
```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

**Workflow tự động:**
1. ✅ Security scans (secret detection, SAST, SCA)
2. ✅ Build all services
3. ✅ Run tests
4. ✅ Build & push Docker images to GHCR
5. ✅ Self-hosted runner pulls images
6. ✅ Generate TLS certificates
7. ✅ Create .env with secrets
8. ✅ Deploy với docker-compose (ALL services including ngrok)
9. ✅ Health checks
10. ✅ Done! Ngrok URL tự động available tại localhost:4040

### Verify
```bash
# Trên server
docker ps  # Xem containers
docker logs ngrok  # Xem ngrok URL

# Test local
curl http://localhost:8080/management/health
curl http://localhost:4040/api/tunnels  # Ngrok API

# Test qua internet
# Mở localhost:4040 để lấy URL, share với bạn bè
```

**Hoàn toàn tự động! Không cần chạy script nào!**

## 🔧 Troubleshooting (Updated)

### Ngrok container không có URL
```bash
# Check logs
docker logs ngrok

# Lỗi thường gặp: "authentication failed"
# → Kiểm tra NGROK_AUTHTOKEN trong .env
nano microservices/docker-compose/.env

# Restart ngrok
docker compose restart ngrok
```

### Ngrok muốn URL mới
```bash
# Simple restart
docker compose restart ngrok

# Xem URL mới
sleep 5 && curl http://localhost:4040/api/tunnels
```

### Frontend không gọi được API qua internet
```bash
# Check nginx-proxy
docker logs nginx-proxy

# Check frontend nginx config
docker exec -it frontend cat /etc/nginx/nginx.conf

# Test connectivity
docker exec -it nginx-proxy wget -O- http://gateway:8080/management/health
```

### Services không healthy sau deploy
```bash
# Xem logs
docker compose logs --tail=100 gateway

# Restart specific service
docker compose restart gateway

# Rebuild and restart
docker compose up -d --build gateway
```

### Port already allocated
```bash
# Ngrok container đã chạy cấu hình cũ
bash scripts/cleanup-old-setup.sh

# Hoặc stop tất cả
docker compose down --remove-orphans
docker ps -a  # Check no orphan containers
```

### Workflow deploy failed
```bash
# Check GitHub Actions logs
# Thường do:
# 1. Thiếu GitHub Secrets (NGROK_AUTHTOKEN, etc.)
# 2. Self-hosted runner offline
# 3. Build errors

# Fix secrets: GitHub → Settings → Secrets → Add
# Fix runner: Restart runner on WSL
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
