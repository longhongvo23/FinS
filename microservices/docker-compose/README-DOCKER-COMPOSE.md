# FinS Docker Compose

## Cách chạy Server (Ubuntu WSL)

### Yêu cầu
- Ubuntu WSL2 với Docker Engine đã cài
- GHCR login: `echo 'YOUR_TOKEN' | docker login ghcr.io -u longhongvo23 --password-stdin`
- TLS certificates đã tạo (trong `mongodb-security/certs/`)

### Chạy nhanh (1 lệnh)
```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS/microservices/docker-compose
docker compose up -d
```

### Chạy bằng script (khuyến nghị)
```bash
bash /mnt/d/HOC_DAI/DATN2025/FinS/scripts/start-server.sh
```

### Dừng server
```bash
docker compose down
```

---

## Cấu hình

- **File duy nhất:** `docker-compose.yml` — bao gồm tất cả services + 4 lớp bảo mật
- **Biến môi trường:** `.env`
- **Certificates:** `mongodb-security/certs/`

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 2302 | http://localhost:2302 |
| Gateway | 8080 | http://localhost:8080 |
| UserService | 8081 | |
| NotificationService | 8082 | |
| StockService | 8083 | |
| NewsService | 8084 | |
| CrawlService | 8085 | |
| AIService | 8086 | |
| AIToolsService | 8087 | |
| Consul | 8500 | http://localhost:8500 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |

## GitHub Actions Self-Hosted Runner

Runner được cài tại `/mnt/d/HOC_DAI/DATN2025/FinS/actions-runner/`.

### Khởi động runner
```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS/actions-runner
./run.sh
```

### Cài runner như service (tự khởi động)
```bash
cd /mnt/d/HOC_DAI/DATN2025/FinS/actions-runner
sudo ./svc.sh install
sudo ./svc.sh start
```

### Kiểm tra trạng thái runner
```bash
sudo ./svc.sh status
```

## 4 Lớp Bảo Mật MongoDB

1. **Authentication** — Username/password riêng cho mỗi service
2. **TLS/SSL** — Mã hóa traffic MongoDB (requireTLS)
3. **Field-Level Encryption** — AES-256-GCM cho fields nhạy cảm (@Encrypted)
4. **Volume Encryption** — Docker named volumes trên ext4/WSL2
