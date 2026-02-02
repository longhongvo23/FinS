# MongoDB Security Implementation Guide
# Hướng dẫn triển khai bảo mật MongoDB

## 📋 Tổng quan

Hệ thống bảo mật MongoDB được triển khai với **4 lớp bảo vệ**:

| Lớp | Tính năng | Mô tả |
|-----|-----------|-------|
| 1 | **Authentication** | Username/Password cho mỗi MongoDB instance |
| 2 | **TLS/SSL** | Mã hóa dữ liệu truyền tải (Encryption in Transit) |
| 3 | **Encrypted Volumes** | Mã hóa dữ liệu lưu trữ (Encryption at Rest) |
| 4 | **Field-Level Encryption** | Mã hóa từng field nhạy cảm trong application |

---

## 🔐 Lớp 1: Authentication (Đã triển khai)

Mỗi MongoDB instance đã được bảo vệ bằng username/password:

```yaml
# docker-compose/.env
USERSERVICE_MONGODB_USER=userservicelong
USERSERVICE_MONGODB_PASSWORD=userservice26012003
```

**✓ Đã hoàn thành cho tất cả services**

---

## 🔒 Lớp 2: TLS/SSL (Encryption in Transit)

### Mục đích
Mã hóa mọi dữ liệu truyền giữa Application ↔ MongoDB để chống nghe lén mạng.

### Cách triển khai

#### Bước 1: Tạo Certificates

**Windows:**
```cmd
cd microservices\docker-compose\mongodb-security\scripts
generate-certs.bat
```

**Linux/Mac:**
```bash
cd microservices/docker-compose/mongodb-security/scripts
chmod +x generate-certs.sh
./generate-certs.sh
```

#### Bước 2: Chạy với TLS enabled
```bash
docker-compose -f docker-compose.yml -f docker-compose.security.yml up -d
```

### Certificates được tạo
```
mongodb-security/certs/
├── ca.crt                    # Certificate Authority
├── ca.key                    # CA Private Key (GIỮ BÍ MẬT!)
├── gateway-mongodb.pem       # Gateway MongoDB server cert
├── userservice-mongodb.pem   # UserService MongoDB server cert
├── *-client.pem              # Client certificates
└── truststore.jks            # Java truststore
```

---

## 🛡️ Lớp 3: Encrypted Volumes (Encryption at Rest)

### Mục đích
Mã hóa files database trên disk. Nếu hacker đánh cắp được file `.wt` của MongoDB, không thể đọc được.

### Cách triển khai trên Linux (Production)

#### Sử dụng LUKS encryption:
```bash
# 1. Tạo encrypted volume
sudo cryptsetup luksFormat /dev/sdb1

# 2. Mở volume
sudo cryptsetup luksOpen /dev/sdb1 mongodb-encrypted

# 3. Format và mount
sudo mkfs.ext4 /dev/mapper/mongodb-encrypted
sudo mount /dev/mapper/mongodb-encrypted /data/mongodb
```

#### Docker với encrypted volume:
```yaml
volumes:
  userservice-mongodb-data:
    driver: local
    driver_opts:
      type: none
      device: /data/mongodb/userservice
      o: bind
```

### Windows (Development)
Sử dụng BitLocker để encrypt drive chứa Docker volumes.

---

## 🔐 Lớp 4: Field-Level Encryption (Client-Side)

### Mục đích
Mã hóa từng field nhạy cảm **trước khi** lưu vào MongoDB. Ngay cả DBA hoặc hacker có full access vào database cũng chỉ thấy ciphertext.

### Các field được mã hóa

#### AppUser
| Field | Lý do |
|-------|-------|
| `email` | PII - Thông tin cá nhân |
| `password_reset_token` | Security token |
| `email_verification_token` | Security token |
| `activation_key` | Security key |
| `two_factor_secret` | 2FA secret - Critical |
| `last_login_ip` | PII - IP có thể xác định vị trí |

#### UserProfile
| Field | Lý do |
|-------|-------|
| `phone_number` | PII - Số điện thoại |
| `full_name` | PII - Họ tên |
| `bio` | Thông tin cá nhân |

#### LoginHistory
| Field | Lý do |
|-------|-------|
| `ip_address` | PII - Địa chỉ IP |
| `location` | PII - Vị trí |

### Cách sử dụng

#### 1. Thêm annotation vào entity:
```java
import com.stockapp.userservice.security.encryption.Encrypted;

@Document(collection = "app_user")
public class AppUser {
    
    @Encrypted(reason = "PII - Personal email address")
    @Field("email")
    private String email;
    
    @Encrypted(reason = "2FA secret - critical security data")
    @Field("two_factor_secret")
    private String twoFactorSecret;
}
```

#### 2. Cấu hình encryption key:
```yaml
# application.yml
application:
  security:
    encryption:
      master-key: ${ENCRYPTION_MASTER_KEY}
      salt: ${ENCRYPTION_SALT:YourUniqueSalt}
```

#### 3. Set environment variable:
```bash
# Generate secure key
openssl rand -base64 32

# Set in environment
export ENCRYPTION_MASTER_KEY="your-generated-key"
```

### Dữ liệu được lưu trong MongoDB
```javascript
// Trước khi mã hóa
{
  "email": "user@example.com",
  "two_factor_secret": "JBSWY3DPEHPK3PXP"
}

// Sau khi mã hóa
{
  "email": "ENC:SGVsbG8gV29ybGQhIFRoaXMgaXMgZW5jcnlwdGVk...",
  "two_factor_secret": "ENC:QW5vdGhlciBlbmNyeXB0ZWQgdmFsdWU..."
}
```

---

## 🚀 Triển khai Production

### 1. Tạo certificates
```bash
cd mongodb-security/scripts
./generate-certs.sh
```

### 2. Tạo encryption keys
```bash
# Tạo master key
MASTER_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_MASTER_KEY=$MASTER_KEY" >> .env

# QUAN TRỌNG: Backup key an toàn!
```

### 3. Chạy với full security
```bash
docker-compose -f docker-compose.yml -f docker-compose.security.yml up -d
```

### 4. Verify TLS
```bash
# Kết nối với TLS
mongosh --tls --tlsCAFile mongodb-security/certs/ca.crt \
  "mongodb://user:pass@localhost:27017/dbname?authSource=admin"
```

---

## ⚠️ Lưu ý quan trọng

### 1. Key Management
- **KHÔNG** commit master key vào git
- Sử dụng secret management (Vault, AWS Secrets Manager, etc.)
- Backup key ở nhiều nơi an toàn
- Key rotation: Cần re-encrypt tất cả data khi đổi key

### 2. Performance
- Field-level encryption có overhead ~5-10%
- Không thể query trên encrypted fields (equality, range, etc.)
- Cân nhắc chỉ encrypt fields thực sự nhạy cảm

### 3. Limitations
- Encrypted fields không thể index
- Không thể sort trên encrypted fields
- Aggregation pipeline không hoạt động với encrypted data

---

## 📝 Trả lời câu hỏi bảo mật

### Q: "Nếu tôi đánh cắp được dữ liệu của anh thì sao?"

**A:** Hệ thống được bảo vệ bởi 4 lớp:

1. **Authentication**: Database yêu cầu username/password, không thể truy cập trực tiếp.

2. **TLS/SSL**: Mọi dữ liệu truyền tải được mã hóa. Nếu nghe lén mạng, chỉ thấy ciphertext.

3. **Encrypted Volumes**: Nếu đánh cắp disk/file vật lý, dữ liệu đã được mã hóa, không đọc được.

4. **Field-Level Encryption**: Ngay cả khi có full access vào database (DBA, hacker có credentials), các field nhạy cảm (email, phone, 2FA secret, tokens) vẫn được mã hóa bằng key riêng của application. Chỉ application với đúng master key mới decrypt được.

**Kết luận**: Để đọc được dữ liệu nhạy cảm, attacker cần:
- MongoDB credentials (Lớp 1)
- TLS certificates (Lớp 2)
- Disk encryption key (Lớp 3)
- Application encryption master key (Lớp 4)

Việc có được TẤT CẢ các key này gần như không thể nếu được quản lý đúng cách.

---

## 📁 Cấu trúc files

```
microservices/docker-compose/
├── docker-compose.yml              # Main compose file
├── docker-compose.security.yml     # Security overlay
├── .env                            # Environment variables
└── mongodb-security/
    ├── certs/                      # TLS certificates
    │   ├── ca.crt
    │   ├── ca.key
    │   ├── *-mongodb.pem
    │   └── *-client.pem
    └── scripts/
        ├── generate-certs.sh       # Linux/Mac
        └── generate-certs.bat      # Windows

microservices/userservice/
└── src/main/java/com/stockapp/userservice/security/encryption/
    ├── Encrypted.java              # Annotation
    ├── EncryptionAlgorithm.java    # Supported algorithms
    ├── EncryptionException.java    # Custom exception
    ├── FieldEncryptionService.java # Core encryption service
    ├── EncryptedFieldEventListener.java # MongoDB listener
    └── package-info.java           # Documentation
```
