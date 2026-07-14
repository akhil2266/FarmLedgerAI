import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import crop_recommendation, profit_prediction, price_prediction, disease_detection, financial_advisor


def _ensure_models_trained():
    """Auto-trains all models on first startup if trained artifacts don't exist yet."""
    model_dir = settings.model_dir
    required_files = [
        model_dir / "crop_recommendation_model.joblib",
        model_dir / "profit_prediction_model.joblib",
        model_dir / "price_prediction_model.joblib",
    ]
    if all(f.exists() for f in required_files):
        print("[startup] Models already trained, skipping.")
        return

    print("[startup] Trained models not found — training now (this may take a few minutes)...")
    scripts_dir = Path(__file__).resolve().parent.parent / "scripts"
    for script in ["train_crop_recommendation.py", "train_profit_prediction.py", "train_price_prediction.py"]:
        print(f"[startup] Running {script}...")
        result = subprocess.run([sys.executable, str(scripts_dir / script)])
        if result.returncode != 0:
            print(f"[startup] WARNING: {script} failed with code {result.returncode}")
    print("[startup] Model training complete.")


_ensure_models_trained()

app = FastAPI(
    title="FarmLedger AI - AI Service",
    description="FastAPI microservice powering crop recommendation, profit/price prediction, "
                 "crop disease detection, and the AI financial advisor for FarmLedger AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_recommendation.router)
app.include_router(profit_prediction.router)
app.include_router(price_prediction.router)
app.include_router(disease_detection.router)
app.include_router(financial_advisor.router)


@app.get("/")
async def root():
    return {"service": "FarmLedger AI - AI Service", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}