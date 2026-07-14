import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from app.config import settings

MODEL_PATH = settings.model_dir / "price_prediction_model.joblib"
CROP_ENCODER_PATH = settings.model_dir / "price_crop_encoder.joblib"
DATASET_PATH = settings.data_dir / "historical_crop_prices_dataset.csv"

_model = None
_crop_encoder = None


def _load_artifacts():
    global _model, _crop_encoder
    if _model is None:
        if not MODEL_PATH.exists():
            train_and_save()
        _model = joblib.load(MODEL_PATH)
        _crop_encoder = joblib.load(CROP_ENCODER_PATH)
    return _model, _crop_encoder


def _safe_encode(encoder: LabelEncoder, value: str):
    value = (value or "unknown").lower()
    if value not in encoder.classes_:
        value = encoder.classes_[0]
    return encoder.transform([value])[0]


def train_and_save():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Training dataset not found at {DATASET_PATH}. "
            f"Run `python scripts/train_price_prediction.py` first."
        )

    df = pd.read_csv(DATASET_PATH, parse_dates=["price_date"])
    df = df.sort_values("price_date")

    crop_encoder = LabelEncoder().fit(df["crop_name"].str.lower())
    df["crop_enc"] = crop_encoder.transform(df["crop_name"].str.lower())
    df["day_of_year"] = df["price_date"].dt.dayofyear
    df["month"] = df["price_date"].dt.month
    df["year"] = df["price_date"].dt.year

    features = ["crop_enc", "day_of_year", "month", "year"]
    X = df[features]
    y = df["modal_price_per_kg"]

    model = XGBRegressor(n_estimators=250, max_depth=5, learning_rate=0.06, random_state=42)
    model.fit(X, y)

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(crop_encoder, CROP_ENCODER_PATH)
    return model


def predict(crop_name: str, market_name: str = None, state: str = None, forecast_horizon_days: int = 30):
    model, crop_encoder = _load_artifacts()

    target_date = datetime.utcnow() + timedelta(days=forecast_horizon_days)
    crop_enc = _safe_encode(crop_encoder, crop_name)

    features = pd.DataFrame(
        [[crop_enc, target_date.timetuple().tm_yday, target_date.month, target_date.year]],
        columns=["crop_enc", "day_of_year", "month", "year"],
    )
    predicted_price = max(float(model.predict(features)[0]), 0.0)

    # Confidence heuristic: shorter horizons are inherently more reliable.
    confidence = max(0.55, 0.95 - (forecast_horizon_days / 365) * 0.4)

    return {
        "predicted_price_per_kg": round(predicted_price, 2),
        "prediction_date": target_date.strftime("%Y-%m-%d"),
        "confidence_score": round(confidence, 4),
        "model_version": "v1",
    }
