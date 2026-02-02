# SmartTrade AI - Bản Ghi Nhớ Phát Triển

## Trạng Thái Hiện Tại: Smart Alerts System

### Đã Hoàn Thành (2024-12-25)

#### Smart Alerts System
Hệ thống cảnh báo thông minh với nhiều điều kiện kết hợp.

- **Database Migration** (`supabase/migrations/006_smart_alerts.sql`):
  - `smart_alerts`: Alert rules với logic AND/OR
  - `smart_alert_conditions`: Điều kiện cho mỗi alert
  - `smart_alert_history`: Lịch sử trigger
  - Functions: `get_user_alert_count`, `can_create_alert`, `record_alert_trigger`

- **Backend API** (`apps/ai-service/app/routers/alerts.py`):
  - `GET /api/v1/alerts`: List alerts
  - `POST /api/v1/alerts`: Create alert
  - `GET /api/v1/alerts/{id}`: Get alert details
  - `PUT /api/v1/alerts/{id}`: Update alert
  - `DELETE /api/v1/alerts/{id}`: Delete alert
  - `POST /api/v1/alerts/{id}/toggle`: Enable/disable
  - `GET /api/v1/alerts/history`: Trigger history
  - `GET /api/v1/alerts/limits`: Check user limits
  - `GET /api/v1/alerts/indicators/info`: Available indicators

- **Alert Engine** (`apps/ai-service/app/services/alert_engine.py`):
  - Kiểm tra điều kiện real-time
  - Hỗ trợ: price, volume, RSI, MACD, MA, Bollinger Bands
  - Logic operators: AND/OR
  - Check intervals: 1m, 5m, 15m, 1h

- **Frontend UI** (`src/pages/alerts/`):
  - Smart Alerts page với tabs (Alerts, History)
  - Alert cards với toggle on/off
  - Multi-step alert builder dialog
  - Condition row component
  - Alert limit banner (Free: 5, Premium: unlimited)

**Route**: `/alerts`

**Indicators hỗ trợ**:
| Indicator | Operators | Description |
|-----------|-----------|-------------|
| price | >=, <=, =, >, < | Giá cổ phiếu |
| volume | >=, <=, >, < | Khối lượng giao dịch |
| change_percent | >=, <=, >, < | % thay đổi giá |
| rsi | >=, <=, crosses_above, crosses_below | RSI (0-100) |
| macd | crosses_above, crosses_below | MACD crossover |
| ma | crosses_above, crosses_below | MA crossover |
| bb | touches_upper, touches_lower | Bollinger Bands |

---

#### AI Research Agent
- **Database Migration** (`supabase/migrations/005_research_agent.sql`):
  - `financial_reports`: Báo cáo tài chính theo quý/năm
  - `stock_news`: Tin tức và phân tích sentiment
  - `ai_research_reports`: Báo cáo AI tự động
  - `research_alerts`: Cảnh báo nghiên cứu cho user
  - Watchlist settings (auto_research, alert_on_news, etc.)

- **AI Agents** (`apps/ai-service/app/agents/`):
  - `financial_crawler.py`: Thu thập BCTC từ CafeF, Vietstock
  - `news_agent.py`: Tìm và phân tích tin tức tự động
  - `research_synthesizer.py`: Tổng hợp AI báo cáo toàn diện

- **Research API** (`apps/ai-service/app/routers/research.py`):
  - `GET /api/v1/research/report/{symbol}`: Full AI research report
  - `GET /api/v1/research/quick-insight/{symbol}`: Quick insight
  - `GET /api/v1/research/financial/{symbol}`: Financial data
  - `GET /api/v1/research/news/{symbol}`: Analyzed news
  - `POST /api/v1/research/batch-research`: Batch for watchlist
  - `GET /api/v1/research/alerts`: User alerts

- **Research Dashboard UI** (`src/pages/research/`):
  - Overview với watchlist research cards
  - Quick stats (mã theo dõi, khuyến nghị, alerts)
  - Stock research cards với AI rating, scores
  - Full research report modal (Sheet)
  - Research alerts banner

**Route**: `/research`

---

#### Analytics Dashboard
- **Database Migration** (`supabase/migrations/004_analytics.sql`): 5 tables cho analytics
  - `analytics_pageviews`: Track page views
  - `analytics_events`: Track user events
  - `analytics_daily_metrics`: Aggregated daily metrics
  - `analytics_feature_usage`: Feature usage tracking
  - `analytics_funnel`: Conversion funnel data

- **Frontend Tracking Service** (`src/services/analytics-service.ts`):
  - Auto session management
  - Page view tracking
  - Custom event tracking (trading, ai, navigation, engagement, conversion)
  - Predefined events: signup, login, order, AI query, stock view, etc.

- **useAnalytics Hook** (`src/hooks/use-analytics.ts`):
  - Auto page view tracking
  - User ID management
  - Location-based tracking

- **Admin Dashboard** (`src/pages/admin/analytics/`):
  - Overview metrics (users, revenue, AI queries, orders)
  - User growth chart (line chart)
  - Revenue chart (bar chart)
  - AI usage chart (area + pie chart)
  - Conversion funnel
  - Feature usage table
  - Top stocks table
  - Realtime users widget

- **Backend API** (`apps/ai-service/app/routers/analytics.py`):
  - `/api/v1/analytics/overview`
  - `/api/v1/analytics/user-growth`
  - `/api/v1/analytics/revenue`
  - `/api/v1/analytics/ai-usage`
  - `/api/v1/analytics/feature-usage`
  - `/api/v1/analytics/funnel`
  - `/api/v1/analytics/top-stocks`
  - `/api/v1/analytics/realtime`

**Route**: `/admin/analytics`

---

### Đã Hoàn Thành (2024-12-24)

#### 1. Sửa Lỗi Màn Hình Đen
- **Lỗi "Cannot parse color: hsl(var(...))"**: Chart library không parse được CSS variables → Đã fix bằng hex colors
- **Lỗi "data must be asc ordered by time"**: Timestamp trùng lặp trong generateChartData → Đã fix dùng ngày thay vì phút
- **Lỗi "Object is disposed"**: Chart bị dispose trước khi hoàn thành → Đã thêm `isDisposed` flag

#### 2. Light Theme TradingView-Style
- **CSS Variables** (`src/index.css`): Bộ màu light/dark hoàn chỉnh theo phong cách TradingView
- **Tailwind Config** (`tailwind.config.js`): Hệ thống màu HSL với CSS variables
- **UI Store** (`src/stores/ui-store.ts`): Quản lý theme với localStorage persistence
- **Settings Page** (`src/pages/settings/display.tsx`): UI chọn theme trực quan
- **Chart Colors Utility** (`src/lib/chart-colors.ts`): Helper functions cho dynamic colors

#### 3. Charts Đã Cập Nhật
| Component | File | Trạng thái |
|-----------|------|------------|
| CandlestickChart | `src/components/charts/candlestick-chart.tsx` | ✅ Dynamic colors |
| MiniLineChart | `src/components/charts/mini-line-chart.tsx` | ✅ Dynamic colors |
| PerformanceChart | `src/components/portfolio/performance-chart.tsx` | ✅ Dynamic colors |
| AllocationChart | `src/components/portfolio/allocation-chart.tsx` | ✅ MutationObserver |

### Cấu Trúc Dự Án

```
apps/web/
├── src/
│   ├── components/
│   │   ├── charts/           # Chart components
│   │   ├── portfolio/        # Portfolio charts
│   │   └── ui/               # shadcn/ui components
│   ├── pages/
│   │   ├── admin/
│   │   │   └── analytics/    # Analytics dashboard
│   │   ├── alerts/           # Smart Alerts system
│   │   ├── research/         # AI Research center
│   │   ├── market/           # Trang thị trường
│   │   └── settings/         # Cài đặt (display.tsx = theme)
│   ├── hooks/
│   │   └── use-analytics.ts  # Analytics hook
│   ├── services/
│   │   └── analytics-service.ts  # Analytics tracking
│   ├── stores/
│   │   └── ui-store.ts       # Theme state management
│   ├── lib/
│   │   ├── chart-colors.ts   # Dynamic chart colors
│   │   └── utils.ts          # Utilities
│   └── index.css             # CSS variables (light/dark)
├── tailwind.config.js
└── package.json

apps/ai-service/
├── app/
│   ├── agents/
│   │   ├── financial_crawler.py  # BCTC crawler
│   │   ├── news_agent.py         # News research
│   │   └── research_synthesizer.py # AI synthesis
│   ├── routers/
│   │   ├── alerts.py         # Smart Alerts API
│   │   ├── analytics.py      # Analytics API
│   │   └── research.py       # Research API
│   └── services/
│       ├── alert_engine.py   # Alert condition checker
│       └── analytics_service.py
└── requirements.txt

supabase/migrations/
├── 004_analytics.sql         # Analytics tables
├── 005_research_agent.sql    # Research tables
└── 006_smart_alerts.sql      # Smart Alerts tables
```

### Lệnh Thường Dùng

```bash
# Chạy dev server
npm run dev

# Build production
npm run build

# Kiểm tra TypeScript
npx tsc --noEmit
```

### Ports

| Service | Port |
|---------|------|
| Web (Vite) | 5173 |
| AI Service | 8000 |

### Công Việc Tiếp Theo (Gợi Ý)

1. **APScheduler cho Smart Alerts**: Thêm background scheduler để check alerts theo interval
2. **WebSocket Real-time**: Gửi alert notification qua WebSocket
3. **Real Market Data**: Kết nối với SSI, VNDirect API cho giá real-time
4. **Push Notifications**: Tích hợp Firebase/OneSignal cho mobile push
5. **Email Notifications**: Tích hợp SendGrid/SES cho email alerts
6. **Premium Subscription**: Tích hợp payment gateway (Stripe/VNPay)

### Lưu Ý Kỹ Thuật

- Chart library `lightweight-charts` không hỗ trợ CSS variables → Phải dùng `getChartColors()`
- Theme changes được detect qua MutationObserver trên `document.documentElement.classList`
- Zustand store persist theme vào localStorage key `ui-storage`

---
*Cập nhật lần cuối: 2024-12-25*
