import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from app.config import settings

MODEL_PATH = settings.model_dir / "crop_recommendation_model.joblib"
ENCODER_PATH = settings.model_dir / "crop_recommendation_label_encoder.joblib"
DATASET_PATH = settings.data_dir / "crop_recommendation_dataset.csv"

FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

_model = None
_label_encoder = None


def _load_artifacts():
    global _model, _label_encoder
    if _model is None or _label_encoder is None:
        if not MODEL_PATH.exists() or not ENCODER_PATH.exists():
            train_and_save()
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
    return _model, _label_encoder


def train_and_save():
    """
    Trains a RandomForestClassifier on the crop recommendation dataset
    (see ai/scripts/train_crop_recommendation.py for dataset generation)
    and persists the model + label encoder to trained_models/.
    """
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Training dataset not found at {DATASET_PATH}. "
            f"Run `python scripts/train_crop_recommendation.py` first."
        )

    df = pd.read_csv(DATASET_PATH)
    X = df[FEATURE_COLUMNS]
    y = df["label"]

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    model = RandomForestClassifier(
        n_estimators=200, max_depth=15, random_state=42, n_jobs=-1, class_weight="balanced"
    )
    model.fit(X, y_encoded)

    settings.model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    return model, encoder


def predict(nitrogen: float, phosphorus: float, potassium: float,
            temperature: float, humidity: float, ph: float, rainfall: float):
    model, encoder = _load_artifacts()

    features = pd.DataFrame(
        [[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]],
        columns=FEATURE_COLUMNS,
    )
    probabilities = model.predict_proba(features)[0]
    top_indices = np.argsort(probabilities)[::-1][:5]

    top_alternatives = [
        {"crop": encoder.inverse_transform([idx])[0], "confidence": round(float(probabilities[idx]), 4)}
        for idx in top_indices
    ]

    best_idx = top_indices[0]
    return {
        "recommended_crop": encoder.inverse_transform([best_idx])[0],
        "confidence_score": round(float(probabilities[best_idx]), 4),
        "top_alternatives": top_alternatives,
        "model_version": "v1",
    }
