"""
Validates the crop recommendation training pipeline end-to-end (dataset generation ->
train -> predict). Requires scikit-learn, pandas, numpy (does NOT require xgboost/tensorflow).
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Minimal reproduction of scripts/train_crop_recommendation.py's core profiles,
# kept small here for fast test execution.
CROP_PROFILES = {
    "rice": ((60, 100), (30, 60), (30, 55), (20, 37), (70, 95), (5.5, 6.5), (1200, 2000)),
    "wheat": ((80, 140), (40, 70), (30, 55), (10, 25), (40, 70), (6.0, 7.5), (500, 900)),
    "cotton": ((60, 110), (25, 50), (25, 50), (21, 35), (45, 75), (6.0, 8.0), (500, 900)),
}
FEATURE_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def _sample_range(low, high, rng):
    mean = (low + high) / 2
    std = (high - low) / 4
    return float(np.clip(rng.normal(mean, std), low - std, high + std))


def _generate_dataset(samples_per_crop=150, seed=42):
    rng = np.random.default_rng(seed)
    rows = []
    for crop, (n_r, p_r, k_r, t_r, h_r, ph_r, rain_r) in CROP_PROFILES.items():
        for _ in range(samples_per_crop):
            rows.append({
                "N": _sample_range(*n_r, rng), "P": _sample_range(*p_r, rng), "K": _sample_range(*k_r, rng),
                "temperature": _sample_range(*t_r, rng), "humidity": np.clip(_sample_range(*h_r, rng), 0, 100),
                "ph": np.clip(_sample_range(*ph_r, rng), 0, 14), "rainfall": max(_sample_range(*rain_r, rng), 0),
                "label": crop,
            })
    return pd.DataFrame(rows)


def test_dataset_generation_produces_balanced_classes():
    df = _generate_dataset(samples_per_crop=100)
    counts = df["label"].value_counts()
    assert len(counts) == 3
    assert all(counts == 100)


def test_model_achieves_high_accuracy_on_held_out_data():
    df = _generate_dataset(samples_per_crop=200)
    X = df[FEATURE_COLUMNS]
    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label"])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)

    assert accuracy > 0.85, f"Expected >85% accuracy on held-out synthetic data, got {accuracy:.2%}"


def test_prediction_matches_expected_crop_for_realistic_input():
    df = _generate_dataset(samples_per_crop=200)
    X = df[FEATURE_COLUMNS]
    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label"])

    model = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X, y)

    # Realistic rice-growing conditions (high N, warm, humid, acidic-neutral pH, high rainfall)
    rice_like = pd.DataFrame([[80, 45, 42, 28, 82, 6.0, 1600]], columns=FEATURE_COLUMNS)
    prediction = encoder.inverse_transform(model.predict(rice_like))[0]
    assert prediction == "rice"

    # Realistic wheat-growing conditions (cooler, drier, lower rainfall)
    wheat_like = pd.DataFrame([[110, 55, 42, 15, 55, 6.8, 700]], columns=FEATURE_COLUMNS)
    prediction2 = encoder.inverse_transform(model.predict(wheat_like))[0]
    assert prediction2 == "wheat"
