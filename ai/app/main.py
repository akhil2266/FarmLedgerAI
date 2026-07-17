import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import crop_recommendation, profit_prediction, price_prediction, disease_detection, financial_advisor


def _ensure_models_trained():
    """Auto-trains any missing models on startup, checked individually."""
    model_dir = settings.model_dir
    scripts_dir = Path(__file__).resolve().parent.parent / "scripts"

    models_to_check = [
        ("crop_recommendation_model.joblib", "train_crop_recommendation.py"),
        ("profit_prediction_model.joblib", "train_profit_prediction.py"),
        ("price_prediction_model.joblib", "train_price_prediction.py"),
        ("disease_detection_model.keras", "train_disease_detection.py"),
    ]

    for filename, script in models_to_check:
        if (model_dir / filename).exists():
            print(f"[startup] {filename} already exists, skipping {script}.")
            continue
        print(f"[startup] Training missing model: running {script}...")
        result = subprocess.run([sys.executable, str(scripts_dir / script)])
        if result.returncode != 0:
            print(f"[startup] WARNING: {script} failed with code {result.returncode}")
    print("[startup] Model training check complete.")


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