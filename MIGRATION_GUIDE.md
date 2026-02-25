# 🎯 HƯỚNG DẪN MIGRATION: Từ Manual sang Containerized Ngrok

## ✨ Tóm tắt thay đổi

Hệ thống đã được **containerize hoàn toàn**. Bạn KHÔNG CẦN chạy `start-ngrok.sh` thủ công nữa!

## 🚀 Bước migration (Chỉ làm 1 lần)

### Bước 1: Lấy Ngrok Auth Token

Vào https://dashboard.ngrok.com/get-started/your-authtoken và copy token của bạn.

### Bước 2: Dọn dẹp cấu hình cũ

```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS

# Chạy cleanup script
bash scripts/cleanup-old-setup.sh
```

Script này sẽ:
- Stop nginx system service
- Xóa file config cũ
- Stop ngrok manual processes  
- Dọn dẹp containers cũ

### Bước 3: Thêm NGROK_AUTHTOKEN

```bash
# Edit file .env
nano microservices/docker-compose/.env

# Thêm dòng này vào cuối file:
NGROK_AUTHTOKEN=your_token_here_from_step_1
```

### Bước 4: Thêm GitHub Secret

Vào GitHub repo → Settings → Secrets and variables → Actions → New repository secret

```
Name: NGROK_AUTHTOKEN
Value: your_token_here
```

### Bước 5: Khởi động hệ thống mới

```bash
bash scripts/start-server.sh
```

**Xong!** Tất cả services bao gồm ngrok đã tự động chạy.

### Bước 6: Xem Ngrok URL

Mở trình duyệt:
```
http://localhost:4040
```

Hoặc terminal:
```bash
docker logs ngrok | grep "url="
curl http://localhost:4040/api/tunnels
```

## ✅ Kiểm tra migration thành công

```bash
cd microservices/docker-compose
docker compose ps
```

Bạn phải thấy:
- ✅ `ngrok` - running
- ✅ `nginx-proxy` - running  
- ✅ `frontend` - running
- ✅ `gateway` - running
- ✅ Tất cả services khác

Kiểm tra ngrok có URL:
```bash
docker logs ngrok
# Phải thấy: "started tunnel" và "url=https://xxx.ngrok-free.app"
```

## 🔄 Workflow mới

### Trước đây (Manual):
```bash
# Terminal 1
bash scripts/start-server.sh  # Start services

# Terminal 2 (phải chạy riêng)
bash scripts/start-ngrok.sh   # Start ngrok manually

# Khi deploy → Phải restart ngrok thủ công
```

### Bây giờ (Automated):
```bash
# Chỉ cần 1 lệnh
bash scripts/start-server.sh  # Tất cả tự động!

# Khi deploy
git push origin main  # Workflow tự động restart ALL (kể cả ngrok)
```

## ❓ FAQ

### Q: Tôi vẫn cần chạy start-ngrok.sh không?

**KHÔNG!** Script đó không còn cần thiết. Ngrok giờ chạy trong container.

### Q: Ngrok URL có thay đổi khi restart không?

**CÓ**, với ngrok free. Để có URL cố định:
- Upgrade ngrok paid ($8/tháng)
- Hoặc dùng Cloudflare Tunnel (miễn phí, cần domain riêng)

### Q: Làm sao xem ngrok URL sau mỗi lần restart?

```bash
# Web UI (khuyên dùng)
http://localhost:4040

# Terminal
docker logs ngrok | grep "url="
```

### Q: Tôi có cần add GitHub Secret không?

**CÓ**, nếu bạn dùng CI/CD workflow. Thêm `NGROK_AUTHTOKEN` vào GitHub Secrets.

### Q: Lỗi "Authentication failed" trong ngrok container?

Kiểm tra `NGROK_AUTHTOKEN` trong file `.env`:
```bash
nano microservices/docker-compose/.env
# Đảm bảo token đúng
```

## 🎯 Lợi ích của containerized setup

| Tiêu chí | Trước (Manual) | Sau (Containerized) |
|----------|----------------|---------------------|
| **Setup** | 2 terminals riêng | 1 lệnh duy nhất |
| **Port conflict** | Hay xảy ra | Không còn |
| **Khi deploy** | Restart thủ công | Tự động |
| **Monitoring** | Khó | Web UI http://localhost:4040 |
| **Auto-restart** | Không | Có (restart: unless-stopped) |
| **Logs** | Nhiều nơi | Tập trung trong docker |

## 🐛 Troubleshooting

### Ngrok container không start
```bash
docker logs ngrok
# Kiểm tra lỗi, thường do thiếu/sai NGROK_AUTHTOKEN
```

### Muốn restart ngrok để lấy URL mới
```bash
docker compose restart ngrok
sleep 5
curl http://localhost:4040/api/tunnels
```

### Port 4000 hoặc 4040 đã bị chiếm
```bash
# Kiểm tra process nào đang dùng
sudo netstat -tlnp | grep -E "4000|4040"

# Stop process cũ
sudo kill -9 <PID>

# Hoặc chạy cleanup
bash scripts/cleanup-old-setup.sh
```

## 📚 Tài liệu liên quan

- [NGROK_SETUP.md](../NGROK_SETUP.md) - Hướng dẫn đầy đủ
- [docker-compose.yml](../microservices/docker-compose/docker-compose.yml) - Config mới
- [nginx-proxy.conf](../microservices/docker-compose/nginx-proxy.conf) - Nginx config

## ✅ Checklist hoàn thành

- [ ] Chạy cleanup script
- [ ] Thêm NGROK_AUTHTOKEN vào .env
- [ ] Thêm NGROK_AUTHTOKEN vào GitHub Secrets
- [ ] Start server với start-server.sh
- [ ] Verify ngrok container running
- [ ] Check ngrok URL tại localhost:4040
- [ ] Test access từ internet
- [ ] Push code để test auto-deploy

Chúc bạn thành công! 🎉
