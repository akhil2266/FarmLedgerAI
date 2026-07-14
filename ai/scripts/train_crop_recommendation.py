"""
Generates a synthetic-but-agronomically-grounded crop recommendation training dataset
and trains the RandomForestClassifier used by app/services/crop_recommendation_service.py.

Each crop's ideal N-P-K / temperature / humidity / pH / rainfall ranges are based on
well-established agronomic reference ranges (the same ranges seeded into
database/schema.sql's crop_catalog table). Samples are drawn with gaussian noise around
each crop's ideal midpoint so the classifier learns realistic, overlapping decision boundaries
rather than an unrealistically clean synthetic separation.

Usage:
    cd ai
    python scripts/train_crop_recommendation.py
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
from app.config import settings
from app.services import crop_recommendation_service as svc

np.random.seed(42)

# crop -> (N_range, P_range, K_range, temp_range, humidity_range, ph_range, rainfall_range)
CROP_PROFILES = {
    "rice":       ((60, 100), (30, 60), (30, 55), (20, 37), (70, 95), (5.5, 6.5), (1200, 2000)),
    "wheat":      ((80, 140), (40, 70), (30, 55), (10, 25), (40, 70), (6.0, 7.5), (500, 900)),
    "maize":      ((60, 120), (30, 60), (25, 50), (18, 32), (50, 80), (5.5, 7.5), (450, 700)),
    "cotton":     ((60, 110), (25, 50), (25, 50), (21, 35), (45, 75), (6.0, 8.0), (500, 900)),
    "sugarcane":  ((100, 160), (40, 70), (40, 80), (20, 38), (65, 90), (6.0, 7.5), (1200, 1800)),
    "chickpea":   ((15, 45), (35, 65), (25, 55), (10, 30), (30, 60), (6.0, 7.5), (300, 500)),
    "soybean":    ((15, 45), (40, 70), (35, 60), (20, 30), (55, 80), (6.0, 7.0), (500, 800)),
    "groundnut":  ((15, 45), (35, 65), (35, 65), (22, 32), (50, 75), (6.0, 7.0), (450, 750)),
    "tomato":     ((80, 140), (50, 90), (50, 90), (18, 29), (50, 75), (6.0, 6.8), (450, 750)),
    "onion":      ((60, 110), (40, 70), (60, 100), (13, 28), (55, 80), (6.0, 7.0), (500, 800)),
    "potato":     ((100, 160), (60, 100), (100, 150), (15, 25), (60, 85), (5.0, 6.5), (400, 600)),
    "banana":     ((100, 180), (40, 70), (150, 220), (20, 35), (70, 95), (6.0, 7.5), (1000, 1500)),
    "mango":      ((30, 70), (20, 50), (30, 60), (24, 35), (45, 75), (5.5, 7.5), (750, 1100)),
    "turmeric":   ((60, 110), (40, 70), (50, 90), (20, 35), (65, 90), (5.5, 7.5), (1000, 1500)),
    "chilli":     ((70, 120), (40, 70), (40, 80), (20, 32), (55, 80), (6.0, 7.0), (500, 800)),
}

SAMPLES_PER_CROP = 400


def sample_range(low, high):
    mean = (low + high) / 2
    std = (high - low) / 4
    return np.clip(np.random.normal(mean, std), low - std, high + std)


def generate_dataset():
    rows = []
    for crop, (n_r, p_r, k_r, t_r, h_r, ph_r, rain_r) in CROP_PROFILES.items():
        for _ in range(SAMPLES_PER_CROP):
            rows.append({
                "N": round(sample_range(*n_r), 2),
                "P": round(sample_range(*p_r), 2),
                "K": round(sample_range(*k_r), 2),
                "temperature": round(sample_range(*t_r), 2),
                "humidity": round(np.clip(sample_range(*h_r), 0, 100), 2),
                "ph": round(np.clip(sample_range(*ph_r), 0, 14), 2),
                "rainfall": round(max(sample_range(*rain_r), 0), 2),
                "label": crop,
            })

    df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
    return df


if __name__ == "__main__":
    print("Generating crop recommendation dataset...")
    df = generate_dataset()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(svc.DATASET_PATH, index=False)
    print(f"Dataset saved: {svc.DATASET_PATH} ({len(df)} rows, {df['label'].nunique()} crop classes)")

    print("Training RandomForestClassifier...")
    model, encoder = svc.train_and_save()
    print(f"Model saved: {svc.MODEL_PATH}")
    print(f"Label encoder saved: {svc.ENCODER_PATH}")
    print("Done.")
