# Installation Guide

This guide walks through setting up FarmLedger AI's three services — MySQL database, Node.js backend, Python AI service — plus the React frontend, entirely on your local machine.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18.x | for backend and frontend |
| npm | ≥ 9.x | ships with Node |
| Python | 3.10 – 3.11 | for the AI service (TensorFlow 2.17 requires ≤3.11 as of writing) |
| MySQL | ≥ 8.0 | or MariaDB ≥ 10.6 |
| pip | latest | Python package manager |

---

## 1. Database Setup

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS farmledger_ai;"
mysql -u root -p farmledger_ai < database/schema.sql
mysql -u root -p farmledger_ai < database/seed.sql
```

This creates all 18 tables and loads realistic sample data (7 users across all 3 roles, 5 farms, 6 crop cycles, expenses, sales, government schemes, and historical crop prices used for AI training reference).

Verify:
```bash
mysql -u root -p farmledger_ai -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM farms;"
```

---

## 2. Backend Setup (Node.js / Express)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — your MySQL credentials
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — generate strong random strings, e.g. `openssl rand -hex 32`
- `AI_SERVICE_URL` — defaults to `http://localhost:8000`, matches the AI service below
- `AI_SERVICE_API_KEY` — any string; **must match** `INTERNAL_API_KEY` in `ai/.env`
- `WEATHER_API_KEY` — optional but required for the Weather page to return live data; get a free key at [openweathermap.org/api](https://openweathermap.org/api)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional, only needed for Google Sign-In
- `SMTP_*` — optional; without these, password-reset emails are logged to the console instead of sent

Install and run:
```bash
npm install
npm run dev      # nodemon, auto-restarts on change
# or
npm start        # production mode
```

The API will be live at `http://localhost:5000`. Confirm with:
```bash
curl http://localhost:5000/api/health
```

---

## 3. AI Service Setup (Python / FastAPI)

```bash
cd ai
cp .env.example .env
```

Edit `.env`:
- `INTERNAL_API_KEY` — must match `AI_SERVICE_API_KEY` in `backend/.env`
- `BACKEND_ORIGIN` — defaults to `http://localhost:5000`, used for CORS

Create a virtual environment (recommended) and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> If installing without a virtualenv on Linux with an externally-managed Python, add `--break-system-packages` to the pip command.

### Train the models

All four models must be trained before the AI endpoints will work (they train-on-first-use as a fallback, but running this explicitly is faster and lets you inspect accuracy):

```bash
python scripts/train_all.py
```

This runs, in order:
1. `train_crop_recommendation.py` — generates an agronomically-grounded synthetic dataset and trains a RandomForestClassifier (~99% held-out accuracy on synthetic data)
2. `train_profit_prediction.py` — generates a cost/yield dataset and trains an XGBoost regressor
3. `train_price_prediction.py` — generates 3 years of seasonal price history and trains an XGBoost regressor
4. `train_disease_detection.py` — trains a CNN. **Uses a synthetic procedurally-generated image dataset by default** (no internet dataset download required) so the full pipeline is genuinely trainable offline. **For real diagnostic accuracy, replace this with a real dataset** (e.g. PlantVillage) — see the docstring at the top of `scripts/train_disease_detection.py` for the exact folder structure expected.

Trained artifacts are written to `ai/trained_models/`.

### Run the service

```bash
uvicorn app.main:app --reload --port 8000
```

Confirm with:
```bash
curl http://localhost:8000/health
```

---

## 4. Frontend Setup (React / CRA)

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
- `REACT_APP_API_BASE_URL` — defaults to `http://localhost:5000/api`
- `REACT_APP_GOOGLE_CLIENT_ID` — optional, only needed if Google Sign-In is enabled on the backend

```bash
npm install
npm start
```

Opens at `http://localhost:3000`. Register a new account (any role) or log in with a seeded demo account — see the root `README.md` for demo credentials.

---

## 5. Verifying the Full Stack

1. Open `http://localhost:3000`, register or log in.
2. Go to **Farms** → add a farm (include latitude/longitude if you want to test Weather).
3. Go to **Crops** → add a crop cycle.
4. Go to **Expenses** / **Sales** → add a few entries.
5. Go to **Dashboard** → confirm charts populate with your data.
6. Go to **AI Tools** → try Crop Recommendation (requires the AI service + trained models to be running).
7. Go to **Reports** → generate a PDF or Excel report and download it.

If any AI Tools call fails with a 503, double-check the AI service is running on port 8000 and that `AI_SERVICE_API_KEY` (backend) matches `INTERNAL_API_KEY` (AI service).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend fails to start, `ER_ACCESS_DENIED` | Check `DB_USER`/`DB_PASSWORD` in `backend/.env` |
| `401 Unauthorized` on every request | Access token expired and refresh failed — clear browser localStorage and log in again |
| AI endpoints return `503` | AI service not running, or `AI_SERVICE_API_KEY` mismatch between backend and AI `.env` files |
| Disease detection returns generic/inaccurate results | Expected if trained on the synthetic fallback dataset — train on a real leaf-image dataset for production use |
| Weather page shows an error | `WEATHER_API_KEY` not set, or the farm has no latitude/longitude |
| `pip install` fails with "externally-managed-environment" | Add `--break-system-packages`, or use a virtualenv |
