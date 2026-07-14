import numpy as np
import cv2
import json
from pathlib import Path
from app.config import settings

MODEL_PATH = settings.model_dir / "disease_detection_model.keras"
CLASS_INDEX_PATH = settings.model_dir / "disease_class_index.json"
IMG_SIZE = 128

TREATMENT_MAP = {
    "healthy": "No treatment needed. Continue regular monitoring and balanced fertilization.",
    "bacterial_blight": "Apply copper-based bactericide. Remove and destroy infected leaves. Avoid overhead irrigation.",
    "leaf_rust": "Apply triazole or strobilurin fungicide. Ensure proper field spacing for airflow.",
    "powdery_mildew": "Apply sulfur-based or systemic fungicide (e.g. myclobutanil). Improve air circulation.",
    "early_blight": "Apply chlorothalonil or mancozeb fungicide. Rotate crops and remove infected debris.",
    "leaf_spot": "Apply copper fungicide spray. Avoid overhead watering and remove affected leaves promptly.",
    "mosaic_virus": "No chemical cure — remove and destroy infected plants immediately to prevent spread. Control aphid vectors.",
    "root_rot": "Improve field drainage. Apply appropriate fungicide drench (e.g. metalaxyl). Avoid overwatering.",
}

SEVERITY_MAP = {
    "healthy": "none",
    "bacterial_blight": "high",
    "leaf_rust": "medium",
    "powdery_mildew": "medium",
    "early_blight": "medium",
    "leaf_spot": "low",
    "mosaic_virus": "critical",
    "root_rot": "high",
}

_model = None
_class_names = None


def _preprocess_image(image_path: str) -> np.ndarray:
    """Reads an image with OpenCV, resizes, normalizes, and returns a batch-ready array."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read the uploaded image. Please upload a valid JPG/PNG file.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    return np.expand_dims(img, axis=0)


def _load_artifacts():
    global _model, _class_names
    if _model is None:
        if not MODEL_PATH.exists() or not CLASS_INDEX_PATH.exists():
            raise FileNotFoundError(
                f"Disease detection model not found at {MODEL_PATH}. "
                f"Run `python scripts/train_disease_detection.py` first to train it."
            )
        # Imported lazily so the whole service doesn't require TensorFlow at import time
        # (keeps startup fast for endpoints that don't need it).
        from tensorflow import keras
        _model = keras.models.load_model(MODEL_PATH)
        with open(CLASS_INDEX_PATH, "r") as f:
            _class_names = json.load(f)
    return _model, _class_names


def predict(image_path: str, crop_name: str = "unknown"):
    model, class_names = _load_artifacts()
    batch = _preprocess_image(image_path)

    predictions = model.predict(batch, verbose=0)[0]
    best_idx = int(np.argmax(predictions))
    confidence = float(predictions[best_idx])
    disease_key = class_names[str(best_idx)] if str(best_idx) in class_names else class_names[best_idx]

    is_healthy = disease_key == "healthy"
    display_name = disease_key.replace("_", " ").title()

    return {
        "detected_disease": display_name,
        "is_healthy": is_healthy,
        "confidence_score": round(confidence, 4),
        "severity": SEVERITY_MAP.get(disease_key, "medium"),
        "recommended_treatment": TREATMENT_MAP.get(disease_key, "Consult a local agricultural extension officer for diagnosis confirmation."),
        "model_version": "v1",
    }
