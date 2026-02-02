# 📈 FinS - Stock Trading & Analytics Platform

> **Full-stack microservices platform for stock market analysis, real-time tracking, AI-powered predictions, and financial news aggregation.**

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Python](https://img.shields.io/badge/Python-3.11-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│                   Next.js 14 + TypeScript                       │
│              (React Server Components + Tailwind)               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (8080)                         │
│              Spring Cloud Gateway + Consul                      │
└───┬────────┬────────┬────────┬────────┬────────┬───────────────┘
    │        │        │        │        │        │
    ▼        ▼        ▼        ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  User  │ │ Stock  │ │  News  │ │ Crawl  │ │ Notify │ │   AI   │
│ Service│ │ Service│ │ Service│ │ Service│ │ Service│ │ Service│
│ (8081) │ │ (8083) │ │ (8084) │ │ (8085) │ │ (8082) │ │ (8086) │
│        │ │        │ │        │ │        │ │        │ │        │
│ Spring │ │ Spring │ │ Spring │ │ Spring │ │ Spring │ │ FastAPI│
│  Boot  │ │  Boot  │ │  Boot  │ │  Boot  │ │  Boot  │ │ Python │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┴──────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │     Infrastructure Layer          │
        │  • MongoDB (Database)             │
        │  • Kafka (Event Streaming)        │
        │  • Consul (Service Discovery)     │
        │  • Prometheus (Monitoring)        │
        └───────────────────────────────────┘
```

---

## 🚀 Key Features

### 📊 Stock Analysis
- **Real-time price tracking** for 7 major stocks (AAPL, GOOGL, MSFT, AMZN, TSLA, META, NVDA)
- **Historical data** from 2015 to present
- **Technical indicators** (52-week high/low, volume, price changes)
- **Financial statements** (Balance Sheet, Income Statement, Cash Flow)

### 🤖 AI-Powered Predictions
- **Prophet-based forecasting** (Meta's time series model)
- **30-day price predictions** with confidence intervals
- **Analyst-style recommendations** (Strong Buy, Buy, Hold, Sell, Strong Sell)
- **Daily automated updates** (1:00 AM scheduler)

### 📰 Financial News
- **Real-time news aggregation** from multiple sources
- **Company-specific news** with relevance scoring
- **Sentiment analysis** integration ready
- **Entity extraction** (companies, industries, keywords)

### 👥 User Management
- **JWT authentication** with refresh tokens
- **User profiles** with privacy settings
- **Watchlist management** for favorite stocks
- **Session tracking** with device fingerprinting
- **2FA support** ready

---

## 🛠️ Tech Stack

### Backend Microservices
| Service | Technology | Port | Description |
|---------|-----------|------|-------------|
| **Gateway** | Spring Cloud Gateway | 8080 | API Gateway & Routing |
| **UserService** | Spring Boot + WebFlux | 8081 | Authentication & User Management |
| **StockService** | Spring Boot + WebFlux | 8083 | Stock Data & Analysis |
| **NewsService** | Spring Boot + WebFlux | 8084 | Financial News Aggregation |
| **CrawlService** | Spring Boot + WebFlux | 8085 | Data Collection & ETL |
| **NotificationService** | Spring Boot + WebFlux | 8082 | Alerts & Notifications |
| **AI Service** | FastAPI + Python 3.11 | 8086 | ML Predictions (Prophet) |

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Server Components

### Infrastructure
- **Database**: MongoDB (with Time Series Collections)
- **Message Broker**: Apache Kafka 4.0
- **Service Discovery**: Consul
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Docker Compose

### AI/ML Libraries
- **Prophet** 1.1.5 (Meta's time series forecasting)
- **Pandas** 2.1.4 (Data manipulation)
- **NumPy** 1.24.3 (Numerical computing)
- **scikit-learn** 1.3.2 (ML utilities)

---

## 📋 Prerequisites

### Required Software
- **Java**: JDK 17 or higher
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **Docker**: 24.x or higher
- **Docker Compose**: v2.20 or higher
- **Maven**: 3.8+ (or use wrapper `./mvnw`)
- **Git**: Latest version

### Recommended Tools
- **IDE**: IntelliJ IDEA / VS Code
- **API Testing**: Postman / Thunder Client
- **Database Client**: MongoDB Compass
- **Docker UI**: Docker Desktop

---

## 🎯 Quick Start

### 1️⃣ Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/FinS.git
cd FinS
```

### 2️⃣ Setup Environment Variables
```bash
# Copy environment templates
cp microservices/aiservice/.env.example microservices/aiservice/.env
cp client/web/.env.example client/web/.env

# Edit .env files with your configuration
```

### 3️⃣ Start Infrastructure & Services
```bash
cd microservices/docker-compose

# Start all services
docker compose up -d

# Check services status
docker compose ps

# View logs
docker compose logs -f aiservice
```

### 4️⃣ Initialize AI Predictions (First Time Only)
```bash
# Generate recommendations for all stocks
for symbol in AAPL GOOGL MSFT AMZN TSLA META NVDA; do
  curl -X POST http://localhost:8086/api/recommendation/generate \
    -H "Content-Type: application/json" \
    -d "{\"symbol\": \"$symbol\"}"
done
```

### 5️⃣ Start Frontend
```bash
cd client/web
pnpm install
pnpm dev
```

### 6️⃣ Access Applications
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **AI Service**: http://localhost:8086
- **Consul UI**: http://localhost:8500
- **Prometheus**: http://localhost:9090

---

## 📂 Project Structure

```
FinS/
├── client/
│   └── web/                    # Next.js Frontend
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       ├── lib/                # Utilities
│       └── services/           # API clients
│
├── microservices/
│   ├── gateway/                # API Gateway (8080)
│   ├── userservice/            # User Management (8081)
│   ├── stockservice/           # Stock Data (8083)
│   ├── newsservice/            # News Aggregation (8084)
│   ├── crawlservice/           # Data Crawler (8085)
│   ├── notificationservice/    # Notifications (8082)
│   ├── aiservice/              # AI Predictions (8086)
│   │   ├── app/
│   │   │   ├── main.py         # FastAPI application
│   │   │   ├── prophet_service.py  # ML predictions
│   │   │   ├── kafka_service.py    # Event handling
│   │   │   └── scheduler.py    # Daily jobs (1 AM)
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── docker-compose/
│   │   └── docker-compose.yml  # All services orchestration
│   │
│   └── app-struc.jdl           # JHipster architecture definition
│
├── .gitignore
├── README.md                   # This file
├── SETUP.md                    # Detailed setup guide
└── GITHUB_GUIDE.md             # GitHub push instructions
```

---

## 🔧 Development

### Run Individual Services

#### Java Services
```bash
cd microservices/stockservice
./mvnw spring-boot:run
```

#### AI Service
```bash
cd microservices/aiservice
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8086
```

#### Frontend
```bash
cd client/web
pnpm dev
```

### Build for Production
```bash
# Build all Java services
cd microservices
./mvnw clean package -DskipTests

# Build AI service Docker image
cd aiservice
docker build -t aiservice:latest .

# Build frontend
cd client/web
pnpm build
```

---

## 🧪 Testing

### Run Tests
```bash
# Java services
./mvnw test

# Python AI service
cd microservices/aiservice
pytest

# Frontend
cd client/web
pnpm test
```

---

## 📊 Key Endpoints

### AI Service (Port 8086)
- `GET /health` - Health check
- `GET /api/symbols` - List all tracked stocks
- `POST /api/predict` - Generate price prediction
- `POST /api/recommendation/generate` - Create recommendation
- `GET /api/recommendation/{symbol}` - Get recommendation by symbol

### Gateway (Port 8080)
- `/api/users/**` - User management
- `/api/stocks/**` - Stock data
- `/api/news/**` - Financial news
- `/api/notifications/**` - Alerts

---

## 🔐 Security Notes

### ⚠️ NEVER COMMIT
- `.env` files
- Database credentials
- API keys
- JWT secrets
- SSL certificates

### ✅ Always Use
- `.env.example` templates
- Environment variables
- Secrets management (e.g., HashiCorp Vault)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend**: Java Spring Boot Team
- **AI/ML**: Python FastAPI Team
- **Frontend**: Next.js Team

---

## 📞 Support

For questions or issues:
- **Email**: support@fins.example.com
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/FinS/issues)
- **Docs**: [Wiki](https://github.com/YOUR_USERNAME/FinS/wiki)

---

## 🎯 Roadmap

- [x] Core microservices architecture
- [x] AI-powered stock predictions
- [x] Real-time price tracking
- [ ] Advanced charting (TradingView integration)
- [ ] Portfolio management
- [ ] Social trading features
- [ ] Mobile app (React Native)

---

**Made with ❤️ by FinS Team**
# DevSecOps Enabled
