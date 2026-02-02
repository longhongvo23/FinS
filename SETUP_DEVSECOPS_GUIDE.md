# 🚀 HƯỚNG DẪN THIẾT LẬP DEVSECOPS TỪ ĐẦU
## Dành cho Đồ Án Sinh Viên - 100% MIỄN PHÍ

---

## 📋 TỔNG QUAN

Hướng dẫn này sẽ giúp bạn thiết lập DevSecOps hoàn chỉnh với các công cụ miễn phí.

### Công cụ sẽ sử dụng:
| Công cụ | Mục đích | Chi phí |
|---------|----------|---------|
| GitHub Actions | CI/CD Pipeline | MIỄN PHÍ (public repo) |
| CodeQL | SAST (Static Analysis) | MIỄN PHÍ |
| Dependabot | Dependency Scanning | MIỄN PHÍ |
| GitLeaks | Secret Detection | MIỄN PHÍ |
| Trivy | Vulnerability Scan | MIỄN PHÍ |
| SonarCloud | Code Quality | MIỄN PHÍ (public repo) |

---

## BƯỚC 1: TẠO REPOSITORY TRÊN GITHUB

### 1.1 Tạo Repository mới

1. Truy cập: https://github.com/new
2. Điền thông tin:
   - **Repository name**: `FinS` (hoặc tên bạn muốn)
   - **Description**: `Financial Intelligence System - Đồ án tốt nghiệp`
   - **Visibility**: ⭐ **PUBLIC** (để được miễn phí không giới hạn)
   - ❌ KHÔNG tick "Add a README file"
   - ❌ KHÔNG tick "Add .gitignore"
3. Click **"Create repository"**

### 1.2 Kết nối local với GitHub

Mở terminal trong thư mục dự án và chạy:

```bash
# Di chuyển đến thư mục dự án
cd "d:\HOC_DAI\DATN2025\FinS"

# Xóa remote cũ (nếu có)
git remote remove origin

# Thêm remote mới (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/FinS.git

# Kiểm tra
git remote -v
```

---

## BƯỚC 2: PUSH CODE LÊN GITHUB

```bash
# Add tất cả files
git add .

# Commit
git commit -m "Initial commit: FinS microservices with DevSecOps"

# Push lên GitHub
git branch -M main
git push -u origin main
```

---

## BƯỚC 3: ENABLE GITHUB SECURITY FEATURES (MIỄN PHÍ)

### 3.1 Vào Settings của Repository

1. Mở repository trên GitHub
2. Click **Settings** (tab phía trên)
3. Click **Code security and analysis** (menu bên trái)

### 3.2 Enable các tính năng sau:

| Tính năng | Action |
|-----------|--------|
| **Dependency graph** | ✅ Enable |
| **Dependabot alerts** | ✅ Enable |
| **Dependabot security updates** | ✅ Enable |
| **Code scanning (CodeQL)** | ✅ Enable (click "Set up" → "Default") |
| **Secret scanning** | ✅ Enable |
| **Secret scanning push protection** | ✅ Enable |

### 3.3 Kết quả mong đợi:
- Tab **Security** sẽ xuất hiện trên repository
- Dependabot sẽ tự động scan dependencies
- CodeQL sẽ tự động scan code

---

## BƯỚC 4: ĐĂNG KÝ SONARCLOUD (MIỄN PHÍ)

### 4.1 Đăng ký tài khoản

1. Truy cập: https://sonarcloud.io
2. Click **"Log in"** → **"Log in with GitHub"**
3. Authorize SonarCloud truy cập GitHub

### 4.2 Import Repository

1. Click **"+"** (góc trên phải) → **"Analyze new project"**
2. Chọn repository **FinS**
3. Click **"Set Up"**
4. Chọn **"Free plan"** (cho public repository)

### 4.3 Lấy SONAR_TOKEN

1. Click avatar góc trên phải → **"My Account"**
2. Chọn tab **"Security"**
3. Trong **"Generate Tokens"**:
   - Name: `fins-github-actions`
   - Click **"Generate"**
4. **COPY TOKEN NGAY** (chỉ hiện 1 lần!)

### 4.4 Lấy thông tin Organization và Project Key

1. Vào project SonarCloud của bạn
2. URL sẽ có dạng: `https://sonarcloud.io/project/overview?id=YOUR_PROJECT_KEY`
3. Ghi nhớ:
   - **Organization**: Thường là GitHub username
   - **Project Key**: Thường là `username_FinS`

---

## BƯỚC 5: THÊM SECRETS VÀO GITHUB

### 5.1 Thêm Secrets

1. Vào repository GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Thêm secret:

| Name | Value |
|------|-------|
| `SONAR_TOKEN` | Token bạn đã copy từ SonarCloud |

### 5.2 Thêm Variables

1. Vẫn trong **Secrets and variables** → **Actions**
2. Click tab **"Variables"**
3. Click **"New repository variable"**
4. Thêm:

| Name | Value |
|------|-------|
| `SONAR_ORGANIZATION` | Organization từ SonarCloud (ví dụ: `longhongvo23`) |
| `SONAR_PROJECT_KEY` | Project Key từ SonarCloud (ví dụ: `longhongvo23_FinS`) |

---

## BƯỚC 6: KIỂM TRA VÀ CHẠY PIPELINE

### 6.1 Push code để trigger pipeline

```bash
# Thêm một thay đổi nhỏ
echo "# DevSecOps Enabled" >> README.md
git add .
git commit -m "ci: Enable DevSecOps pipeline"
git push origin main
```

### 6.2 Xem Pipeline chạy

1. Vào repository → Tab **"Actions"**
2. Sẽ thấy pipeline **"DevSecOps Simple (Student Edition)"** đang chạy
3. Click vào để xem chi tiết

### 6.3 Xem kết quả Security

1. Tab **"Security"** → **"Overview"**
2. Xem:
   - **Dependabot alerts**: Vulnerabilities trong dependencies
   - **Code scanning alerts**: Vấn đề bảo mật trong code
   - **Secret scanning alerts**: Secrets bị lộ

---

## BƯỚC 7: XEM KẾT QUẢ TRÊN SONARCLOUD

1. Truy cập: https://sonarcloud.io
2. Click vào project FinS
3. Xem các metrics:
   - **Bugs**: Lỗi trong code
   - **Vulnerabilities**: Lỗ hổng bảo mật
   - **Security Hotspots**: Điểm cần review
   - **Code Smells**: Code cần cải thiện
   - **Coverage**: % code được test

---

## 📊 BADGES CHO README

Thêm vào README.md để gây ấn tượng:

```markdown
# FinS - Financial Intelligence System

![CI/CD](https://github.com/YOUR_USERNAME/FinS/actions/workflows/devsecops-simple.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=alert_status)](https://sonarcloud.io/dashboard?id=YOUR_PROJECT_KEY)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=security_rating)](https://sonarcloud.io/dashboard?id=YOUR_PROJECT_KEY)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=YOUR_PROJECT_KEY)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=bugs)](https://sonarcloud.io/dashboard?id=YOUR_PROJECT_KEY)
```

*(Thay YOUR_USERNAME và YOUR_PROJECT_KEY bằng thông tin thực)*

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo repository PUBLIC trên GitHub
- [ ] Push code lên GitHub
- [ ] Enable Dependabot alerts
- [ ] Enable Dependabot security updates
- [ ] Enable CodeQL scanning
- [ ] Enable Secret scanning
- [ ] Đăng ký SonarCloud
- [ ] Thêm SONAR_TOKEN vào GitHub Secrets
- [ ] Thêm SONAR_ORGANIZATION vào GitHub Variables
- [ ] Thêm SONAR_PROJECT_KEY vào GitHub Variables
- [ ] Pipeline chạy thành công
- [ ] Thêm badges vào README

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Pipeline failed?
- Kiểm tra logs trong tab Actions
- Pipeline có `continue-on-error: true` nên một số lỗi không block

### SonarCloud không hoạt động?
- Kiểm tra SONAR_TOKEN đã thêm đúng chưa
- Repository phải PUBLIC

### CodeQL không chạy?
- Đảm bảo đã enable trong Settings → Code security
- Hoặc sẽ tự động chạy từ workflow

### Dependabot không hiện alerts?
- Cần đợi vài phút sau khi enable
- Kiểm tra Settings → Code security

---

## 📚 TÀI LIỆU THAM KHẢO

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [SonarCloud Docs](https://docs.sonarcloud.io)
- [CodeQL Docs](https://codeql.github.com/docs)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

---

**Tác giả:** FinS Team  
**Ngày tạo:** 2026-02-02
