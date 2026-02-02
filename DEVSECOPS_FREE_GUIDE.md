# 🎓 DevSecOps Miễn Phí cho Đồ Án Sinh Viên

## 📋 Tổng Quan

Tài liệu này hướng dẫn triển khai DevSecOps **100% MIỄN PHÍ** phù hợp cho đồ án sinh viên.

---

## 🆓 Danh Sách Công Cụ Miễn Phí

| Công cụ | Mục đích | Giới hạn miễn phí | Link |
|---------|----------|-------------------|------|
| **GitHub Actions** | CI/CD | 2,000 phút/tháng (public repo: unlimited) | [github.com](https://github.com) |
| **SonarCloud** | Code Quality + SAST | Miễn phí cho public repo | [sonarcloud.io](https://sonarcloud.io) |
| **CodeQL** | SAST | Miễn phí cho public repo | Built-in GitHub |
| **Trivy** | Container + Dependency Scan | Miễn phí | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) |
| **OWASP ZAP** | DAST | Miễn phí mã nguồn mở | [zaproxy.org](https://www.zaproxy.org) |
| **Dependabot** | Dependency Updates | Miễn phí | Built-in GitHub |
| **GitLeaks** | Secret Detection | Miễn phí | [gitleaks](https://github.com/gitleaks/gitleaks) |
| **Snyk** | SCA | 200 tests/tháng miễn phí | [snyk.io](https://snyk.io) |
| **Checkov** | IaC Security | Miễn phí mã nguồn mở | [bridgecrew/checkov](https://github.com/bridgecrewio/checkov) |

---

## 🚀 Hướng Dẫn Triển Khai Từng Bước

### Bước 1: Đăng ký SonarCloud (Miễn phí)

1. Truy cập [sonarcloud.io](https://sonarcloud.io)
2. Đăng nhập bằng GitHub
3. Import repository của bạn
4. Chọn "Free plan" cho public repository
5. Lấy `SONAR_TOKEN` từ: **My Account → Security → Generate Token**
6. Thêm vào GitHub Secrets:
   - Vào Repository → Settings → Secrets and variables → Actions
   - Thêm `SONAR_TOKEN` và `SONAR_HOST_URL=https://sonarcloud.io`

```
📝 Lưu ý: SonarCloud miễn phí KHÔNG GIỚI HẠN cho public repository!
```

### Bước 2: Enable GitHub Security Features (Miễn phí)

1. Vào Repository → Settings → Code security and analysis
2. Enable các tính năng sau:
   - ✅ **Dependency graph** 
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Code scanning** (CodeQL)
   - ✅ **Secret scanning**

### Bước 3: Đăng ký Snyk (200 tests miễn phí/tháng)

1. Truy cập [snyk.io](https://snyk.io)
2. Đăng nhập bằng GitHub
3. Import repository
4. Lấy `SNYK_TOKEN` từ Account Settings
5. Thêm vào GitHub Secrets

### Bước 4: Push code và xem kết quả

```bash
git add .
git commit -m "ci: Enable DevSecOps pipeline"
git push origin main
```

Xem kết quả tại:
- **GitHub Actions**: Repository → Actions
- **Security Alerts**: Repository → Security
- **SonarCloud**: sonarcloud.io → Your Project
- **CodeQL**: Repository → Security → Code scanning

---

## 📊 Pipeline Đã Cấu Hình

Pipeline `.github/workflows/devsecops-pipeline.yml` bao gồm:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIỄN PHÍ 100%                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Secret Scan] ──→ [SAST] ──→ [Build] ──→ [Container Scan]    │
│       │              │           │              │               │
│   GitLeaks       CodeQL      Maven          Trivy              │
│   TruffleHog     SpotBugs    pnpm                              │
│                  ESLint                                         │
│                  Bandit                                         │
│                                                                 │
│  [Dependency Scan] ──→ [IaC Scan] ──→ [DAST] ──→ [Report]     │
│       │                    │            │                       │
│    Trivy               Checkov      OWASP ZAP                  │
│    OWASP DC                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Các Secrets Cần Cấu Hình

Vào: Repository → Settings → Secrets and variables → Actions

| Secret Name | Bắt buộc | Cách lấy |
|-------------|----------|----------|
| `SONAR_TOKEN` | ✅ Có | SonarCloud → My Account → Security |
| `SONAR_HOST_URL` | ✅ Có | `https://sonarcloud.io` |
| `SNYK_TOKEN` | ⚠️ Tùy chọn | Snyk → Account Settings |
| `GITHUB_TOKEN` | ✅ Auto | Tự động tạo bởi GitHub |

---

## 📈 Dashboard Miễn Phí

| Dashboard | URL | Mục đích |
|-----------|-----|----------|
| GitHub Security | `github.com/<user>/<repo>/security` | Vulnerability alerts |
| SonarCloud | `sonarcloud.io/dashboard?id=<project>` | Code quality |
| GitHub Actions | `github.com/<user>/<repo>/actions` | CI/CD status |
| Snyk | `app.snyk.io` | Dependency vulnerabilities |

---

## ✅ Checklist Triển Khai

### Bắt buộc (Miễn phí 100%)
- [ ] Enable GitHub Dependabot alerts
- [ ] Enable GitHub Secret scanning  
- [ ] Enable GitHub CodeQL
- [ ] Cấu hình GitHub Actions workflow
- [ ] Đăng ký SonarCloud (miễn phí cho public repo)

### Nên có (Miễn phí với giới hạn)
- [ ] Đăng ký Snyk (200 tests/tháng)
- [ ] Cấu hình OWASP ZAP DAST
- [ ] Trivy container scanning

### Tùy chọn nâng cao
- [ ] Checkov IaC scanning
- [ ] Integration với Slack/Discord alerts

---

## 🎯 Kết Quả Mong Đợi

Sau khi triển khai, bạn sẽ có:

1. **Security Tab trên GitHub** với:
   - Dependabot alerts
   - Code scanning alerts (CodeQL)
   - Secret scanning alerts

2. **SonarCloud Dashboard** với:
   - Code coverage
   - Code smells
   - Security hotspots
   - Technical debt

3. **CI/CD Pipeline** tự động:
   - Build và test mỗi commit
   - Scan security mỗi commit
   - Report artifacts

---

## 💡 Tips cho Sinh Viên

### 1. Public Repository = Unlimited Free
```
Nếu đồ án không yêu cầu bảo mật source code,
hãy để PUBLIC để được miễn phí không giới hạn!
```

### 2. Badge cho README
Thêm badges vào README.md để gây ấn tượng:

```markdown
![CI/CD](https://github.com/<user>/<repo>/actions/workflows/devsecops-pipeline.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=<project>&metric=alert_status)](https://sonarcloud.io/dashboard?id=<project>)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=<project>&metric=security_rating)](https://sonarcloud.io/dashboard?id=<project>)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=<project>&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=<project>)
```

### 3. Demo cho Hội đồng
- Mở GitHub Security tab
- Show SonarCloud dashboard
- Chạy pipeline live
- Giải thích từng bước

---

## 🆘 Troubleshooting

### Pipeline chạy quá lâu?
- Sử dụng workflow đơn giản hóa: `.github/workflows/devsecops-simple.yml`
- Comment bớt các job không cần thiết

### SonarCloud không hoạt động?
- Kiểm tra SONAR_TOKEN đã thêm vào secrets
- Đảm bảo repository là PUBLIC

### GitHub Actions hết quota?
- Public repo: Không giới hạn
- Private repo: 2000 phút/tháng
- Giải pháp: Chuyển sang public repo

---

## 📚 Tài Liệu Tham Khảo

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DevSecOps Best Practices](https://www.devsecops.org/)

---

**Tác giả:** FinS Team  
**Ngày cập nhật:** 2026-02-02  
**License:** MIT
