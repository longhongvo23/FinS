# Ngrok Free vs Paid: Static Domains

## ✅ UPDATE: Ngrok Free CÓ Static Domain!

**Domain hiện tại (FREE):**
```
https://gabrielle-polymeric-iconoclastically.ngrok-free.dev
```

### Ngrok cung cấp 2 loại domains:

1. **`.ngrok-free.app`** (Random) - Đổi mỗi khi restart
   - Ví dụ: `https://f982-118-71-215-186.ngrok-free.app`
   - Không cần config
   
2. **`.ngrok-free.dev`** (Static) - CỐ ĐỊNH, không đổi! ✨
   - Ví dụ: `https://gabrielle-polymeric-iconoclastically.ngrok-free.dev`
   - Cần config `--domain` flag
   - **MIỄN PHÍ** - không cần paid plan!

## ✨ Đã Config Static Domain

File `docker-compose.yml` đã được cập nhật:
```yaml
ngrok:
  command: 
    - "http"
    - "--domain=gabrielle-polymeric-iconoclastically.ngrok-free.dev"
    - "nginx-proxy:4000"
```

**Benefits:**
- ✅ URL không đổi khi restart container
- ✅ URL không đổi khi restart server
- ✅ Share 1 lần, dùng mãi mãi
- ✅ Hoàn toàn MIỄN PHÍ

## ❌ Vấn đề CŨ đã được FIX

**Trước đây tôi nghĩ:**
- Domain trong dashboard chỉ dùng được với paid plan
- Free plan chỉ có random URLs

**Sự thật:**
- Ngrok free CÓ static domains với suffix `.ngrok-free.dev`
- Domain `.ngrok-free.app` trong dashboard là paid
- Domain `.ngrok-free.dev` là FREE!

## 📊 So sánh Free vs Paid

| Tính năng | Free Plan | Paid Plan ($10/month) |
|-----------|-----------|----------------------|
| **URLs** | Random (thay đổi mỗi restart) | Static domain cố định |
| **Số tunnels** | 1 tunnel | 3+ tunnels |
| **Bandwidth** | Giới hạn | Unlimited |
| **Custom domains** | ❌ KHÔNG | ✅ CÓ |
| **Reserved domains** | ❌ KHÔNG | ✅ CÓ |

## 🔄 3 Options để có URL cố định

### Option 1: Upgrade Ngrok Paid ($10/month)

**Ưu điểm:**
- ✅ Domain cố định: `gabrielle-go-venture-deserves-artificially.ngrok-free.app`
- ✅ Setup đơn giản (chỉ thêm --domain flag)
- ✅ Hỗ trợ official

**Nhược điểm:**
- ❌ Tốn $10/tháng
- ❌ Phụ thuộc vào ngrok service

**Setup:**
```yaml
command: 
  - "http"
  - "--domain=gabrielle-go-venture-deserves-artificially.ngrok-free.app"
  - "nginx-proxy:4000"
```

**Link upgrade:** https://dashboard.ngrok.com/billing/choose-a-plan

---

### Option 2: Cloudflare Tunnel (FREE - KHUYÊN DÙNG!) ⭐

**Ưu điểm:**
- ✅ MIỄN PHÍ hoàn toàn
- ✅ Domain tự chọn: `fins.yourdomain.com`
- ✅ HTTPS tự động + DDoS protection  
- ✅ Không giới hạn bandwidth
- ✅ Không thay đổi URL

**Nhược điểm:**
- ❌ Cần có domain riêng (~$1-2/năm từ Namecheap, Porkbun)
- ❌ Setup phức tạp hơn một chút

**Setup:**

1. **Mua domain (~$1-2/năm)**
   - Namecheap: https://www.namecheap.com
   - Porkbun: https://porkbun.com
   - Cloudflare Registrar: https://www.cloudflare.com/products/registrar/

2. **Thêm domain vào Cloudflare (free)**
   - https://dash.cloudflare.com
   - Add site → Follow DNS setup

3. **Install Cloudflare Tunnel**
   ```bash
   # On WSL
   curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
   sudo dpkg -i cloudflared.deb
   ```

4. **Login và tạo tunnel**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create fins
   ```

5. **Config tunnel**
   ```bash
   nano ~/.cloudflared/config.yml
   ```
   
   ```yaml
   tunnel: <YOUR_TUNNEL_ID>
   credentials-file: /home/<USER>/.cloudflared/<TUNNEL_ID>.json
   
   ingress:
     - hostname: fins.yourdomain.com
       service: http://localhost:4000
     - service: http_status:404
   ```

6. **Tạo DNS record**
   ```bash
   cloudflared tunnel route dns fins fins.yourdomain.com
   ```

7. **Run as service**
   ```bash
   sudo cloudflared service install
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

**Kết quả:** Domain cố định `https://fins.yourdomain.com` - không bao giờ đổi!

---

### Option 3: VPS + Nginx Reverse Proxy (FREE nếu có VPS)

**Ưu điểm:**
- ✅ Kiểm soát 100%
- ✅ Domain tự chọn
- ✅ Không phụ thuộc bên thứ 3

**Nhược điểm:**
- ❌ Cần VPS (~$5/tháng)
- ❌ Phải tự maintain
- ❌ Setup phức tạp nhất

**Setup:**
```bash
# On VPS
sudo apt install nginx
```

```nginx
# /etc/nginx/sites-available/fins
server {
    listen 80;
    server_name fins.yourdomain.com;
    
    location / {
        proxy_pass http://your-wsl-ip:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🎯 Recommendation

| Use case | Recommend |
|----------|-----------|
| **Test với bạn bè** | Ngrok Free (random URLs ok) |
| **Demo cho khách hàng** | **Cloudflare Tunnel** ⭐ |
| **Production nhỏ** | Cloudflare Tunnel hoặc VPS |
| **Production lớn** | VPS/Cloud (AWS, GCP, Azure) |
| **Quick & Easy** | Ngrok Paid ($10/month) |

## 🔧 Hiện tại đang dùng: Ngrok Free

**URLs sẽ thay đổi mỗi khi restart:**
- Restart container → URL mới
- Server reboot → URL mới
- Deploy mới → URL mới

**Cách lấy URL hiện tại:**
```bash
# Windows
scripts\get-ngrok-url.bat

# Linux/Mac
bash scripts/get-ngrok-url.sh

# Hoặc mở: http://localhost:4040
```

**Workflow:**
1. Restart PC/Deploy code
2. Chạy script lấy URL mới
3. Share URL mới cho team
4. Repeat mỗi lần restart

**Tốt nhất:** Nếu dùng thường xuyên, đầu tư ~$1-2 mua domain + dùng **Cloudflare Tunnel** (free forever)!

## 💡 Tóm tắt

- ❌ Domain trong ngrok dashboard = chỉ là preview, **cần paid mới dùng**
- ✅ Ngrok Free = OK cho test, nhưng URL đổi liên tục
- ⭐ Cloudflare Tunnel = **Best choice** (free + stable + CDN)
- 💰 Ngrok Paid = Nhanh nhất nhưng tốn $10/tháng
- 🏠 VPS = Best cho production scale lớn

**Next step:** Nếu muốn static domain → Recommend mua domain rẻ ($1-2/năm) + setup Cloudflare Tunnel (30 phút setup, free forever!)
