# 🎬 KỊCH BẢN VIDEO GIỚI THIỆU FinS — SmartTrade Platform

> **Phong cách:** Tối giản (Minimalist) — lấy cảm hứng từ quảng cáo Notion  
> **Thời lượng:** ~3 phút 00 giây  
> **Nhạc nền:** Lo-fi electronic nhẹ nhàng, tiết tấu chậm, tăng dần cuối video  
> **Tone giọng:** Bình tĩnh, tự tin, chuyên nghiệp — giọng nam trầm hoặc giọng nữ rõ ràng  
> **Màu sắc chủ đạo:** Nền trắng/đen xen kẽ, accent xanh dương (#3B82F6), xanh lá nhạt cho phần bảo mật  
> **Typography:** Font sans-serif hiện đại (Inter / SF Pro), text xuất hiện bằng hiệu ứng fade-in hoặc typewriter  

---

## PHẦN 0 — HOOK MỞ ĐẦU (0:00 – 0:15)

### Hình ảnh
- **[0:00–0:05]** Màn hình đen hoàn toàn. Một con trỏ nhấp nháy ở giữa.  
  Dòng chữ gõ từng ký tự:  
  ```
  Thị trường thay đổi mỗi giây.
  Bạn cần gì để đi trước một bước?
  ```

- **[0:05–0:10]** Text biến mất. Logo **FinS** fade-in ở giữa màn hình trắng.  
  Dưới logo: `Stock Trading & Analytics Platform`  
  Logo có animation nhẹ — glow effect xanh dương lan tỏa.

- **[0:10–0:15]** Cut nhanh: montage 3 thiết bị (laptop → tablet → điện thoại) đều hiển thị giao diện FinS.  
  Text overlay nhỏ góc dưới: *"One platform. Every device."*

### Voiceover
> *"Thị trường thay đổi mỗi giây. Để đi trước, bạn cần một nền tảng thực sự thông minh — FinS."*

---

## PHẦN 1 — ĐA NỀN TẢNG (0:15 – 0:45)

### Tiêu đề chuyển cảnh
Nền trắng. Chữ lớn xuất hiện ở giữa rồi dịch lên:

```
Mọi nơi. Mọi thiết bị.
```

### Hình ảnh

- **[0:15–0:25]** Camera zoom vào màn hình laptop — giao diện **Dashboard** của FinS trên trình duyệt web.  
  Hiển thị:
  - Biểu đồ giá cổ phiếu real-time (AAPL, TSLA, NVDA)
  - Sidebar với Watchlist, thông báo
  - AI Recommendation badge: `Strong Buy`
  
  > Tinh tế: thanh URL hiển thị `app.fins.vn` — cho thấy đây là web app

- **[0:25–0:32]** Smooth transition — giao diện **thu nhỏ** và "rơi" vào một chiếc **iPad**.  
  Cùng dữ liệu, layout responsive — AI Chat panel mở bên phải.  
  Người dùng chạm vào mã `MSFT` → trang chi tiết cổ phiếu mở ra mượt mà.

- **[0:32–0:40]** Giao diện tiếp tục "rơi" vào **điện thoại Android**.  
  Hiện thanh trạng thái Android, icon app **SmartTrade** trên home screen.  
  Mở app → màn hình Market overview với danh sách cổ phiếu, biểu đồ sparkline.  
  Push notification hiện lên trên cùng: *"🔔 NVDA vượt ngưỡng $950 — Xem ngay"*

- **[0:40–0:45]** Split screen 3 thiết bị cạnh nhau, cùng đồng bộ.  
  Text overlay trung tâm:

  ```
  Web → Tablet → Mobile
  Một codebase. Capacitor + Next.js.
  ```

  Dưới cùng, nhỏ: icon React + Capacitor + iOS + Android

### Voiceover
> *"FinS chạy trên mọi thiết bị — từ trình duyệt desktop, đến tablet, đến điện thoại trong túi bạn. Một codebase duy nhất, triển khai mọi nơi — nhờ Capacitor và React. Dữ liệu đồng bộ real-time, trải nghiệm nhất quán."*

---

## PHẦN 2 — MICROSERVICES ARCHITECTURE (0:45 – 1:25)

### Tiêu đề chuyển cảnh
Nền chuyển sang **đen**. Chữ trắng xuất hiện:

```
Được xây dựng để mở rộng.
```

### Hình ảnh

- **[0:45–0:55]** Từ giữa màn hình đen, một **node hình lục giác** sáng lên — đó là `API Gateway`.  
  Từ nó, 7 đường nét mảnh tỏa ra các node khác, mỗi node sáng lên tuần tự:

  ```
  UserService → StockService → NewsService → CrawlService 
  → NotificationService → AIToolsService → AI Service (Python)
  ```

  Mỗi node có icon riêng và port number nhỏ bên cạnh.  
  Style: giống sơ đồ mạng nơ-ron — đẹp, minimal, animated.

- **[0:55–1:05]** Camera zoom vào node **StockService**.  
  Bên trong node "mở ra" như một cửa sổ:
  - Dòng code Java Spring Boot WebFlux → reactive stream đang chạy
  - Label: `Reactive Non-blocking I/O`
  - Số liệu: `7 cổ phiếu × real-time data × 1000+ requests/s`

  Bên cạnh lần lượt xuất hiện 3 icon infrastructure:
  | Icon | Label |
  |------|-------|
  | 🍃 | MongoDB — Time Series Collections |
  | 📨 | Apache Kafka 4.0 — Event Streaming |
  | 🔍 | Consul — Service Discovery |

- **[1:05–1:15]** Camera zoom vào node **AI Service**.  
  Bên trong hiện giao diện chat AI:
  - User hỏi: *"NVDA có nên mua không?"*
  - Bot trả lời với biểu đồ Prophet forecast 30 ngày, kèm nhận định `Strong Buy (85% confidence)`
  - Label: `Meta Prophet + FastAPI + Python 3.11`

- **[1:15–1:25]** Zoom out — toàn bộ sơ đồ microservices hiện đầy đủ.  
  Các đường kết nối nhấp nháy nhẹ — thể hiện data flowing.  
  Text overlay:

  ```
  8 microservices. Độc lập triển khai.
  Spring Boot + FastAPI + Kafka + Consul.
  Scale từng phần — không scale cả khối.
  ```

### Voiceover
> *"FinS không phải một khối monolithic. Nó được thiết kế từ đầu theo kiến trúc microservices — 8 service độc lập, giao tiếp qua Kafka, khám phá nhau qua Consul. Mỗi service có thể scale riêng, deploy riêng, fail riêng — mà không ảnh hưởng phần còn lại. UserService, StockService, AI Service — mỗi thành phần làm đúng một việc, và làm tốt."*

---

## PHẦN 3 — AN NINH MONGODB (1:25 – 2:10)

### Tiêu đề chuyển cảnh
Nền xanh lá đậm (#065F46). Biểu tượng khóa 🔒 xuất hiện giữa màn hình. Chữ trắng:

```
Bảo mật không phải tùy chọn.
Bảo mật là nền tảng.
```

### Hình ảnh

- **[1:25–1:35]** Hiển thị một **document MongoDB** dạng JSON đẹp, nền tối:

  ```json
  {
    "email": "john@example.com",
    "phone": "+84 123 456 789",
    "two_factor_secret": "JBSWY3DPEHPK3PXP"
  }
  ```

  Sau đó, hiệu ứng "mã hóa" — từng field biến đổi thành ciphertext:

  ```json
  {
    "email": "ENC:dGhpcyBpcyBlbmNyeX...",
    "phone": "ENC:YW5vdGhlciBlbmNyeX...",
    "two_factor_secret": "ENC:c2VjcmV0IGtleSBl..."
  }
  ```

  Label góc phải: `AES-256-GCM · Client-Side Field Level Encryption`

- **[1:35–1:50]** Sơ đồ **4 lớp bảo mật** xuất hiện dạng xếp chồng từ dưới lên (stacking animation):

  | Lớp | Tên | Mô tả |
  |-----|-----|-------|
  | 🔑 Lớp 1 | **Authentication** | Mỗi service có tài khoản MongoDB riêng biệt |
  | 🔐 Lớp 2 | **Field-Level Encryption** | 17+ fields mã hóa AES-256-GCM |
  | 🔒 Lớp 3 | **TLS/SSL In-Transit** | Mã hóa traffic giữa App ↔ MongoDB |
  | 💾 Lớp 4 | **Encryption at Rest** | Dữ liệu trên ổ đĩa cũng được mã hóa |

  Mỗi lớp sáng lên kèm checkmark ✅ khi được nhắc đến.

- **[1:50–2:00]** Hiển thị bảng các service và field được mã hóa:
  
  Animation: 7 service xuất hiện thành hàng, mỗi service có "khiên" bảo vệ.  
  Phía dưới mỗi service, số field mã hóa hiện ra:
  
  ```
  UserService    → 11 fields (email, password tokens, 2FA, IP...)
  Notification   → 3 fields  
  AITools        → 5 fields (user questions, AI responses...)
  StockService   → 1 field
  CrawlService   → 1 field
  ```

  Text nhấn mạnh: `Principle of Least Privilege — Mỗi service chỉ truy cập đúng database của mình.`

- **[2:00–2:10]** Visual metaphor: Một "kẻ tấn công" (icon hacker đơn giản, minimal) cố gắng đọc database.  
  Thấy toàn bộ dữ liệu là `ENC:...` — không đọc được gì.  
  Text: 
  
  ```
  Ngay cả khi database bị đánh cắp,
  dữ liệu vẫn an toàn.
  ```

  PBKDF2 · 100,000 iterations · Unique IV per field

### Voiceover
> *"Với FinS, bảo mật được xây từ nền tảng — không phải thêm sau. MongoDB được bảo vệ bởi 4 lớp: xác thực riêng biệt cho từng service theo nguyên tắc least privilege, mã hóa từng trường dữ liệu nhạy cảm bằng AES-256-GCM ngay tại client — hơn 17 trường bao gồm email, số điện thoại, 2FA secret, lịch sử đăng nhập. Thêm TLS cho dữ liệu đang truyền, và encryption at rest cho dữ liệu lưu trữ. Kết quả? Ngay cả khi ai đó lấy được toàn bộ database — họ chỉ thấy ciphertext vô nghĩa."*

---

## PHẦN 4 — DEVSECOPS PIPELINE (2:10 – 2:50)

### Tiêu đề chuyển cảnh
Nền đen. Terminal cursor nhấp nháy. Chữ xanh lá (#22C55E) gõ ra:

```
$ git push origin main
→ Triggering DevSecOps Pipeline...
```

### Hình ảnh

- **[2:10–2:20]** Pipeline visualization — dạng flowchart ngang, mỗi stage là một node tròn:

  ```
  [🔐 Secret Detection] → [🔍 SAST] → [📦 SCA] → [🏗️ Build & Test] → [🔬 SonarCloud] → [🐳 Container Build] → [🏗️ IaC Scan] → [📋 Summary]
  ```

  Mỗi node sáng lên tuần tự từ trái sang phải, kèm tên tool:

  | Stage | Tools |
  |-------|-------|
  | Secret Detection | TruffleHog + GitLeaks |
  | SAST | Checkstyle + SpotBugs |
  | SCA | Trivy Vulnerability Scanner |
  | Build & Test | Maven + JUnit (7 services song song) |
  | SonarCloud | Code quality + Security hotspots |
  | Container | Jib → GHCR (GitHub Container Registry) |
  | IaC Scan | Checkov (Dockerfile, GitHub Actions, K8s) |

- **[2:20–2:35]** Zoom vào màn hình **GitHub Actions** thực tế:
  - Dashboard hiển thị pipeline đang chạy
  - Matrix build: 7 Java services chạy **song song**
  - Checkmark xanh lần lượt xuất hiện cho từng job
  - SonarCloud quality gate: **Passed** ✅
  - Security summary table hiện ra cuối cùng

  Text overlay animated:
  ```
  Mỗi lần push code = 11 bước kiểm tra bảo mật tự động
  Phát hiện secrets, lỗ hổng, CVE — trước khi đến production.
  ```

- **[2:35–2:45]** Sơ đồ "Shift Left Security":
  
  Timeline từ trái sang phải: `Code → Build → Test → Deploy → Production`  
  Mũi tên lớn chỉ sang trái với text: `Security moves LEFT ←`  
  
  Bên dưới: so sánh nhỏ
  ```
  ❌ Truyền thống: Tìm lỗi bảo mật ở Production → Chi phí sửa cao
  ✅ DevSecOps:   Tìm lỗi bảo mật từ lúc code → Chi phí sửa thấp
  ```

- **[2:45–2:50]** Quay lại terminal, output cuối cùng:

  ```
  ✅ Pipeline completed — All security checks passed
  ✅ Images pushed to GHCR
  ✅ Deployed to production
  ```

  Text overlay:
  ```
  Tự động. Liên tục. An toàn.
  CI/CD with Security built-in.
  ```

### Voiceover
> *"Mỗi dòng code đều đi qua một pipeline DevSecOps 11 bước — hoàn toàn tự động trên GitHub Actions. Bắt đầu bằng phát hiện secrets rò rỉ với TruffleHog và GitLeaks. Tiếp theo, phân tích mã tĩnh với SpotBugs, quét dependency với Trivy, kiểm tra chất lượng code trên SonarCloud. 7 service được build song song, đóng container và đẩy lên GitHub Container Registry. Kết thúc bằng quét hạ tầng IaC với Checkov. Tất cả diễn ra tự động — mỗi lần push. Shift left — phát hiện sớm, sửa nhanh, chi phí thấp."*

---

## PHẦN 5 — CLOSING & CTA (2:50 – 3:00)

### Hình ảnh

- **[2:50–2:55]** Nền trắng. 4 keyword xuất hiện lần lượt, xếp thành 2 hàng 2 cột, font lớn:

  ```
  ┌───────────────────┬───────────────────┐
  │  📱 Cross-Platform │  🏗️ Microservices │
  ├───────────────────┼───────────────────┤
  │  🔒 MongoDB Security │  🔄 DevSecOps  │
  └───────────────────┴───────────────────┘
  ```

  Mỗi ô có glow animation nhẹ lần lượt.

- **[2:55–3:00]** Tất cả mờ đi. Logo **FinS** xuất hiện lớn ở giữa.  
  Tagline phía dưới fade-in:

  ```
  FinS — Invest Smarter.
  ```

  Dưới cùng:
  ```
  github.com/FinS · Built with ❤️ by [Tên nhóm]
  ```

### Voiceover
> *"FinS — đa nền tảng, microservices, bảo mật đa lớp, DevSecOps từ ngày đầu. Không chỉ là một ứng dụng chứng khoán — mà là một nền tảng được thiết kế đúng cách. FinS — Invest Smarter."*

---

## 📐 BẢNG TỔNG HỢP KỸ THUẬT SẢN XUẤT

| Yếu tố | Chi tiết |
|---------|----------|
| **Thời lượng** | ~3 phút |
| **Tỷ lệ khung hình** | 16:9 (1920×1080 hoặc 4K) |
| **FPS** | 30 fps (smooth transitions) |
| **Font chính** | Inter Bold / Inter Regular |
| **Bảng màu** | `#FFFFFF` (nền sáng), `#0F172A` (nền tối), `#3B82F6` (accent xanh), `#065F46` (security green), `#22C55E` (terminal green) |
| **Nhạc nền** | Lo-fi electronic ambient — gợi ý: Artlist/Epidemic Sound, keyword "minimal tech" |
| **Sound effects** | Keyboard typing, soft whoosh transitions, subtle notification ding |
| **Công cụ gợi ý** | After Effects / Motion (animation), Figma (mockup), Screen Studio (screen recording) |
| **Giọng đọc** | AI voice (ElevenLabs) hoặc thu giọng thật, tone bình tĩnh, tốc độ vừa |

---

## 🎯 CÁC NGUYÊN TẮC PHONG CÁCH (NOTION-INSPIRED)

1. **Khoảng trắng rộng rãi** — Không nhồi nhét. Mỗi khung hình chỉ truyền tải 1 ý chính.
2. **Typography là visual chính** — Text lớn, đẹp, đặt ở vị trí trung tâm hoặc rule of thirds.
3. **Chuyển cảnh nhẹ nhàng** — Fade, slide nhẹ. Không zoom xoay quá mạnh.
4. **Mỗi phần có màu nền riêng** — Trắng (đa nền tảng) → Đen (microservices) → Xanh lá đậm (bảo mật) → Đen (DevSecOps) → Trắng (closing).
5. **Giao diện thật** — Dùng screen recording thực tế của FinS, không dùng mockup giả.
6. **Ít chữ trên màn hình** — Voiceover làm nặng phần giải thích, hình ảnh chỉ hiện keyword/số liệu.
7. **Data-driven** — Hiện con số cụ thể: "17+ fields mã hóa", "8 microservices", "11 bước pipeline", "4 lớp bảo mật".

---

## 📝 FULL VOICEOVER SCRIPT (LIỀN MẠCH)

> Thị trường thay đổi mỗi giây. Để đi trước, bạn cần một nền tảng thực sự thông minh — FinS.
>
> FinS chạy trên mọi thiết bị — từ trình duyệt desktop, đến tablet, đến điện thoại trong túi bạn. Một codebase duy nhất, triển khai mọi nơi — nhờ Capacitor và React. Dữ liệu đồng bộ real-time, trải nghiệm nhất quán.
>
> FinS không phải một khối monolithic. Nó được thiết kế từ đầu theo kiến trúc microservices — 8 service độc lập, giao tiếp qua Kafka, khám phá nhau qua Consul. Mỗi service có thể scale riêng, deploy riêng, fail riêng — mà không ảnh hưởng phần còn lại. UserService, StockService, AI Service — mỗi thành phần làm đúng một việc, và làm tốt.
>
> Với FinS, bảo mật được xây từ nền tảng — không phải thêm sau. MongoDB được bảo vệ bởi 4 lớp: xác thực riêng biệt cho từng service theo nguyên tắc least privilege, mã hóa từng trường dữ liệu nhạy cảm bằng AES-256-GCM ngay tại client — hơn 17 trường bao gồm email, số điện thoại, 2FA secret, lịch sử đăng nhập. Thêm TLS cho dữ liệu đang truyền, và encryption at rest cho dữ liệu lưu trữ. Kết quả? Ngay cả khi ai đó lấy được toàn bộ database — họ chỉ thấy ciphertext vô nghĩa.
>
> Mỗi dòng code đều đi qua một pipeline DevSecOps 11 bước — hoàn toàn tự động trên GitHub Actions. Bắt đầu bằng phát hiện secrets rò rỉ với TruffleHog và GitLeaks. Tiếp theo, phân tích mã tĩnh với SpotBugs, quét dependency với Trivy, kiểm tra chất lượng code trên SonarCloud. 7 service được build song song, đóng container và đẩy lên GitHub Container Registry. Kết thúc bằng quét hạ tầng IaC với Checkov. Tất cả diễn ra tự động — mỗi lần push. Shift left — phát hiện sớm, sửa nhanh, chi phí thấp.
>
> FinS — đa nền tảng, microservices, bảo mật đa lớp, DevSecOps từ ngày đầu. Không chỉ là một ứng dụng chứng khoán — mà là một nền tảng được thiết kế đúng cách. FinS — Invest Smarter.
