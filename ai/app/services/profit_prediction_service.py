import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from app.config import settings

MODEL_PATH = settings.model_dir / "profit_prediction_model.joblib"
CROP_ENCODER_PATH = settings.model_dir / "profit_crop_encoder.joblib"
SOIL_ENCODER_PATH = settings.model_dir / "profit_soil_encoder.joblib"
SEASON_ENCODER_PATH = settings.model_dir / "profit_season_encoder.joblib"
DATASET_PATH = settings.data_dir / "profit_prediction_dataset.csv"

# Average market price per kg used as a fallback signal when historical data is sparse.
DEFAULT_PRICE_PER_KG = {
    "rice": 21.5, "wheat": 24.0, "maize": 19.0, "cotton": 67.0, "sugarcane": 3.2,
    "chickpea": 55.0, "soybean": 42.0, "groundnut": 57.0, "tomato": 18.0, "onion": 20.0,
    "potato": 15.0, "banana": 14.0, "mango": 45.0, "turmeric": 95.0, "chilli": 84.0,
}

_model = None
_crop_encoder = None
_soil_encoder = None
_season_encoder = None


def _load_artifacts():
    global _model, _crop_encoder, _soil_encoder, _season_encoder
    if _model is None:
        if not MODEL_PATH.exists():
            train_and_save()
        _model = joblib.load(MODEL_PATH)
        _crop_encoder = joblib.load(CROP_ENCODER_PATH)
        _soil_encoder = joblib.load(SOIL_ENCODER_PATH)
        _season_encoder = joblib.load(SEASON_ENCODER_PATH)
    return _model, _crop_encoder, _soil_encoder, _season_encoder


def _safe_encode(encoder: LabelEncoder, value: str):
    value = (value or "unknown").lower()
    if value not in encoder.classes_:
        value = encoder.classes_[0]
    return encoder.transform([value])[0]


def train_and_save():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Training dataset not found at {DATASET_PATH}. "
            f"Run `python scripts/train_profit_prediction.py` first."
        )

    df = pd.read_csv(DATASET_PATH)

    crop_encoder = LabelEncoder().fit(df["crop_name"].str.lower())
    soil_encoder = LabelEncoder().fit(df["soil_type"].str.lower())
    season_encoder = LabelEncoder().fit(df["season"].str.lower())

    df["crop_enc"] = crop_encoder.transform(df["crop_name"].str.lower())
    df["soil_enc"] = soil_encoder.transform(df["soil_type"].str.lower())
    df["season_enc"] = season_encoder.transform(df["season"].str.lower())

    features = ["crop_enc", "soil_enc", "season_enc", "area_acres", "estimated_cost"]
    X = df[features]
    y = df["actual_yield_kg"]

    model = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42)
    model.fit(X, y)

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(crop_encoder, CROP_ENCODER_PATH)
    joblib.dump(soil_encoder, SOIL_ENCODER_PATH)
    joblib.dump(season_encoder, SEASON_ENCODER_PATH)
    return model


def predict(crop_name: str, area_acres: float, estimated_cost: float,
            soil_type: str = None, season: str = None, state: str = None):
    model, crop_encoder, soil_encoder, season_encoder = _load_artifacts()

    crop_enc = _safe_encode(crop_encoder, crop_name)
    soil_enc = _safe_encode(soil_encoder, soil_type or "loamy")
    season_enc = _safe_encode(season_encoder, season or "kharif")

    features = pd.DataFrame(
        [[crop_enc, soil_enc, season_enc, area_acres, estimated_cost]],
        columns=["crop_enc", "soil_enc", "season_enc", "area_acres", "estimated_cost"],
    )
    predicted_yield_kg = max(float(model.predict(features)[0]), 0.0)

    price_per_kg = DEFAULT_PRICE_PER_KG.get((crop_name or "").lower(), 25.0)
    predicted_revenue = predicted_yield_kg * price_per_kg
    predicted_profit = predicted_revenue - estimated_cost
    predicted_roi = (predicted_profit / estimated_cost * 100) if estimated_cost > 0 else 0.0

    return {
        "predicted_yield_kg": round(predicted_yield_kg, 2),
        "predicted_price_per_kg": round(price_per_kg, 2),
        "predicted_revenue": round(predicted_revenue, 2),
        "predicted_profit": round(predicted_profit, 2),
        "predicted_roi_percent": round(predicted_roi, 2),
        "model_version": "v1",
    }
