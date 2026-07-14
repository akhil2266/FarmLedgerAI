# Deployment Guide

FarmLedger AI deploys as three independent services plus a managed MySQL database.

```
Vercel (frontend)  →  Render (backend)  →  Railway (AI service)
                            ↓
                     Managed MySQL (PlanetScale / Railway MySQL / AWS RDS / etc.)
```

---

## 1. Database

Provision a MySQL 8.0+ instance on any provider (Railway MySQL, PlanetScale, AWS RDS, DigitalOcean Managed MySQL, etc.). Then:

```bash
mysql -h <host> -P <port> -u <user> -p <database> < database/schema.sql
mysql -h <host> -P <port> -u <user> -p <database> < database/seed.sql   # optional demo data
```

Keep the connection details handy for the backend's environment variables.

---

## 2. Backend → Render

1. Push this repo to GitHub/GitLab.
2. In Render: **New → Blueprint**, point it at the repo. Render will detect `backend/render.yaml`.
   - Alternatively, **New → Web Service**, set **Root Directory** to `backend`, **Build Command** `npm install`, **Start Command** `npm start`.
3. Set environment variables (see `backend/.env.example` for the full list) — at minimum:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generate with `openssl rand -hex 32`)
   - `CLIENT_URL` — your deployed Vercel frontend URL (for CORS)
   - `AI_SERVICE_URL` — your deployed Railway AI service URL
   - `AI_SERVICE_API_KEY` — must match the AI service's `INTERNAL_API_KEY`
   - `WEATHER_API_KEY` (optional), `GOOGLE_CLIENT_ID`/`SECRET` (optional), `SMTP_*` (optional)
4. Render will build and deploy. Health check path is `/api/health`.
5. Uploaded files (`backend/uploads/`) are ephemeral on Render's free tier — for production, mount a persistent disk or switch `middleware/upload.js` to an object-storage backend (S3-compatible) before going live.

---

## 3. AI Service → Railway

1. In Railway: **New Project → Deploy from GitHub repo**, set **Root Directory** to `ai`.
2. Railway will detect `ai/railway.json` (Nixpacks builder) and `ai/Procfile`/`ai/runtime.txt`.
3. Set environment variables (see `ai/.env.example`):
   - `INTERNAL_API_KEY` — must match the backend's `AI_SERVICE_API_KEY`
   - `BACKEND_ORIGIN` — your deployed Render backend URL (for CORS)
4. **Train the models before or immediately after first deploy.** The simplest approach for a first deploy: SSH into the Railway service (or run a one-off Railway job) and execute:
   ```bash
   python scripts/train_all.py
   ```
   Trained model artifacts land in `ai/trained_models/`, which must persist across deploys — Railway volumes work well here. Alternatively, train locally and commit the small model files (`.joblib`, `.keras`, `.json`) to the repo under `ai/trained_models/` so they ship with every deploy (this repo's `.gitignore`, if added, should then explicitly allow that folder).
5. TensorFlow + OpenCV are heavy dependencies — Railway's Nixpacks build may need a few minutes and a plan with sufficient build memory.

---

## 4. Frontend → Vercel

1. In Vercel: **New Project**, import the repo, set **Root Directory** to `frontend`.
2. Vercel auto-detects Create React App via `frontend/vercel.json`.
3. Set environment variables:
   - `REACT_APP_API_BASE_URL` — your deployed Render backend URL + `/api`
   - `REACT_APP_GOOGLE_CLIENT_ID` (optional)
4. Deploy. The `rewrites` rule in `vercel.json` ensures client-side routing (React Router) works on refresh/deep links.

---

## 5. Post-Deploy Checklist

- [ ] Visit the Vercel URL, register an account, confirm login works (backend reachable, CORS configured with the right `CLIENT_URL`)
- [ ] Add a farm, crop, expense, sale — confirm the dashboard charts populate
- [ ] Test an AI Tools call (e.g. Crop Recommendation) — confirms backend ↔ AI service connectivity and the `AI_SERVICE_API_KEY`/`INTERNAL_API_KEY` match
- [ ] Test Disease Detection image upload — confirms Multer + FastAPI multipart handling in production
- [ ] Generate a PDF and Excel report — confirms `uploads/reports` write access
- [ ] Confirm Weather page returns data for a farm with lat/lon (requires `WEATHER_API_KEY`)
- [ ] Rotate all secrets away from `.env.example` defaults

---

## Environment Variable Cross-Reference

| Variable | Set in | Must match |
|---|---|---|
| `AI_SERVICE_API_KEY` (backend) | Render | `INTERNAL_API_KEY` (AI service, Railway) |
| `AI_SERVICE_URL` (backend) | Render | Railway AI service's public URL |
| `CLIENT_URL` (backend) | Render | Vercel frontend's public URL |
| `BACKEND_ORIGIN` (AI service) | Railway | Render backend's public URL |
| `REACT_APP_API_BASE_URL` (frontend) | Vercel | Render backend's public URL + `/api` |
