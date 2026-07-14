# 🌾 FarmLedger AI

**An AI-powered, enterprise-grade agriculture management platform** for farmers, buyers, and administrators — combining farm financial management with machine learning-driven crop, price, and disease intelligence.

---

## ✨ Features

| Category | Features |
|---|---|
| **Auth** | JWT authentication, Google Sign-In (optional), role-based access (Farmer / Buyer / Admin) |
| **Farm Management** | Multi-farm support, soil profile (N/P/K/pH), irrigation & soil type tracking |
| **Crop Management** | Full crop-cycle tracking from sowing to harvest, season/status tracking |
| **Financials** | Expense tracking (12 categories, receipt uploads), sales tracking (invoices), auto-computed Profit/Loss & ROI |
| **Dashboard** | Investment trend, profit trend, expense breakdown, crop-wise profit, monthly/yearly revenue, ROI analysis — all live Recharts/Chart.js visualizations |
| **AI Tools** | Crop recommendation (RandomForest), profit prediction (XGBoost), price prediction (XGBoost time-series), crop disease detection (CNN + OpenCV), AI financial advisor (rule engine + statistical signals) |
| **Marketplace** | Farmer listings, buyer browsing & ordering, order lifecycle tracking |
| **Other** | Weather integration (OpenWeatherMap), government schemes directory, notifications, PDF/Excel report generation, voice assistant (Web Speech API), dark/light/system theming with glassmorphism UI |
| **Admin** | Platform-wide analytics, user management, audit logs |

---

## 🏗️ Architecture

```
FarmLedgerAI/
├── frontend/     React 18 (CRA) + Material UI + Framer Motion + Recharts + Chart.js
├── backend/      Node.js + Express (MVC) + MySQL (mysql2) + JWT + Multer
├── ai/           Python FastAPI + scikit-learn + XGBoost + TensorFlow/Keras + OpenCV
├── database/     MySQL schema + seed data
└── docs/         API docs, installation guide, deployment guide
```

**Data flow:** React frontend → Express REST API (MySQL) → (for AI features) → FastAPI AI microservice → results logged back to MySQL and surfaced in the dashboard.

The Node backend is the **only** service the frontend talks to. It authenticates every request, and for AI-powered features it proxies to the FastAPI service using a shared internal API key (`AI_SERVICE_API_KEY` / `INTERNAL_API_KEY`), never exposing the AI service directly to the browser.

---

## 🚀 Quick Start

See **[docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md)** for full setup instructions. In short:

```bash
# 1. Database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 2. Backend
cd backend && cp .env.example .env   # edit DB credentials
npm install && npm run dev            # http://localhost:5000

# 3. AI Service
cd ai && cp .env.example .env
pip install -r requirements.txt --break-system-packages
python scripts/train_all.py           # trains all 4 models
uvicorn app.main:app --reload         # http://localhost:8000

# 4. Frontend
cd frontend && cp .env.example .env
npm install && npm start              # http://localhost:3000
```

**Demo login** (after seeding): `ramesh.reddy@example.com` / `Password@123` (farmer role — see `database/seed.sql` for all demo accounts; every seeded user shares this password via a real bcrypt hash).

---

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION_GUIDE.md) — full local setup, environment variables, model training
- [API Documentation](docs/API_DOCUMENTATION.md) — every REST endpoint across backend + AI service
- [Deployment Guide](docs/DEPLOYMENT.md) — Vercel (frontend), Render (backend), Railway (AI service)

---

## 🧪 Testing

```bash
# Backend (Jest + Supertest)
cd backend && npm install && npm test

# AI Service (pytest)
cd ai && pip install pytest -r requirements.txt --break-system-packages && pytest -v
```

---

## 🔒 Security Notes for Production

- Rotate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `AI_SERVICE_API_KEY` to strong random values (never use the `.env.example` defaults).
- The AI service's `disease_detection_service.py` ships with a synthetic-data training fallback for pipeline validation — **swap in a real labeled dataset (e.g. PlantVillage) before relying on it for real diagnoses.**
- Configure `SMTP_*` for real password-reset emails (falls back to console logging in dev).
- Set `WEATHER_API_KEY` (OpenWeatherMap) for live weather data.

---

## 📄 License

Provided as a reference implementation for educational and commercial adaptation. No warranty is expressed or implied — review, test, and harden before production deployment.
