# 🎉 Static Domain Solution - Hoàn Toàn MIỄN PHÍ!

## ✨ URL Cố Định

```
https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
```

**Đặc điểm:**
- ✅ **CỐ ĐỊNH** - Không đổi khi restart container
- ✅ **CỐ ĐỊNH** - Không đổi khi restart server  
- ✅ **CỐ ĐỊNH** - Không đổi khi deploy code mới
- ✅ **MIỄN PHÍ 100%** - Không cần paid plan

## 🚀 Cách sử dụng

### 1. Khởi động server (lần đầu hoặc sau khi tắt PC)

```bash
# Windows - WSL
wsl
cd /mnt/d/HOC_DAI/DATN2025/FinS
bash scripts/start-server.sh
```

### 2. Lấy URL (luôn là URL cố định)

```bash
# Windows
scripts\get-ngrok-url.bat

# Linux/Mac  
bash scripts/get-ngrok-url.sh

# Hoặc mở Web UI
http://localhost:4040
```

**Output:**
```
✅ Ngrok is running with STATIC DOMAIN!

📡 Static URL: https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
🖥️  Web UI:    http://localhost:4040

✨ This URL is PERMANENT - never changes on restart!
```

### 3. Share với team

Gửi URL này cho bạn bè/đồng đội **1 LẦN DUY NHẤT:**

```
https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
```

**Họ có thể:**
- ✅ Bookmark URL này
- ✅ Dùng mãi mãi, không cần update
- ✅ Login, test features bình thường

## 🔄 Workflow sau khi restart PC

```bash
# 1. Bật PC, mở WSL
wsl

# 2. Docker tự động start containers (đã config restart: unless-stopped)
docker ps  # Check containers

# 3. URL vẫn là:
# https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
# KHÔNG CẦN làm gì thêm!
```

## 📝 Technical Details

### Config trong docker-compose.yml

```yaml
ngrok:
  image: ngrok/ngrok:latest
  command: 
    - "http"
    - "--domain=gabrielle-polymeric-iconoclastically.ngrok-free.dev"
    - "nginx-proxy:4000"
  environment:
    - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
```

### Ngrok Domain Types

| Domain Type | Example | Behavior | Cost |
|-------------|---------|----------|------|
| **Random** | `f982-118-71-215-186.ngrok-free.app` | Đổi mỗi restart | Free |
| **Static (.dev)** | `gabrielle-polymeric-iconoclastically.ngrok-free.dev` | **CỐ ĐỊNH** | **Free** ✨ |
| **Static (.app)** | `your-name.ngrok-free.app` | CỐ ĐỊNH | Paid ($10/mo) |

### Why .ngrok-free.dev works?

Ngrok cung cấp 2 loại free domains:
1. **`.ngrok-free.app`** - Random subdomain (tự động tạo)
2. **`.ngrok-free.dev`** - Static subdomain (cần specify với `--domain`)

Domain `.ngrok-free.dev` từ dashboard **CÓ THỂ dùng FREE**, khác với `.ngrok-free.app` cần paid!

## 🎯 Benefits

### Trước đây (Random URLs):
```
❌ Restart → URL mới → Share lại cho team
❌ Deploy → URL mới → Update docs
❌ Server reboot → URL mới → Thông báo mọi người
```

### Bây giờ (Static Domain):
```
✅ Restart → URL KHÔNG ĐỔI
✅ Deploy → URL KHÔNG ĐỔI  
✅ Server reboot → URL KHÔNG ĐỔI
✅ Share 1 lần → Dùng mãi mãi
```

## 📊 Comparison

| Feature | Random Free | Static Free (.dev) | Paid |
|---------|-------------|-------------------|------|
| URL cố định | ❌ | ✅ | ✅ |
| Cost | Free | **Free** | $10/mo |
| Tunnels | 1 | 1 | 3+ |
| Bandwidth | Limited | Limited | Unlimited |
| Perfect for | Quick test | **Team collaboration** | Production |

## 🔧 Troubleshooting

### Ngrok không start?

```bash
# Check logs
docker logs ngrok

# Thường do thiếu NGROK_AUTHTOKEN
# Check file: microservices/docker-compose/.env
```

### URL không hoạt động?

```bash
# Test từ local
curl https://gabrielle-polymeric-iconoclastically.ngrok-free.dev

# Check ngrok Web UI
http://localhost:4040
```

### Container tự động restart?

```bash
# Đã config trong docker-compose.yml:
restart: unless-stopped

# Containers tự động start khi:
# - Docker daemon start
# - Server reboot
# - Container crash
```

## 📚 Related Docs

- [NGROK_SETUP.md](NGROK_SETUP.md) - Full setup guide
- [NGROK_FREE_VS_PAID.md](NGROK_FREE_VS_PAID.md) - Detailed comparison
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration from old setup

## 🌟 Summary

**Vấn đề đã giải quyết:**
- ✅ URL cố định, không đổi khi restart
- ✅ Hoàn toàn miễn phí
- ✅ Không cần upgrade paid plan
- ✅ Perfect cho team collaboration

**Public URL của bạn:**
```
https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
```

**Share URL này và enjoy! 🎉**
