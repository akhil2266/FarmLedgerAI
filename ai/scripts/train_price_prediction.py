"""
Generates a synthetic 3-year daily/weekly historical crop price dataset with
realistic seasonal cycles + long-term inflationary drift, and trains the XGBoost
regressor used by app/services/price_prediction_service.py.

Usage:
    cd ai
    python scripts/train_price_prediction.py
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.config import settings
from app.services import price_prediction_service as svc

np.random.seed(42)

# crop -> (base price per kg, seasonal amplitude, harvest_month with lowest price)
CROP_PRICE_PROFILE = {
    "rice": (21.0, 3.0, 10), "wheat": (23.5, 2.5, 4), "maize": (18.5, 2.0, 10),
    "cotton": (65.0, 6.0, 11), "sugarcane": (3.1, 0.3, 3), "chickpea": (54.0, 5.0, 3),
    "soybean": (41.0, 4.5, 10), "groundnut": (56.0, 5.5, 10), "tomato": (17.0, 6.0, 12),
    "onion": (19.0, 7.0, 3), "potato": (14.5, 4.0, 2), "banana": (13.5, 1.5, 6),
    "mango": (44.0, 8.0, 5), "turmeric": (92.0, 8.0, 2), "chilli": (82.0, 9.0, 1),
}

DAYS_OF_HISTORY = 365 * 3


def generate_dataset():
    rows = []
    start_date = datetime.utcnow() - timedelta(days=DAYS_OF_HISTORY)

    for crop, (base_price, amplitude, low_month) in CROP_PRICE_PROFILE.items():
        for day_offset in range(0, DAYS_OF_HISTORY, 7):  # weekly samples
            date = start_date + timedelta(days=day_offset)
            day_of_year = date.timetuple().tm_yday
            # Seasonal cycle: lowest around harvest month, highest 6 months later.
            phase = ((low_month - 1) / 12) * 2 * np.pi
            seasonal = amplitude * -np.cos((day_of_year / 365) * 2 * np.pi - phase)
            # Long-term inflation drift (~6%/year).
            years_elapsed = day_offset / 365
            drift = base_price * (0.06 * years_elapsed)
            noise = np.random.normal(0, amplitude * 0.15)

            modal_price = max(base_price + seasonal + drift + noise, 1.0)
            min_price = modal_price * np.random.uniform(0.90, 0.96)
            max_price = modal_price * np.random.uniform(1.04, 1.10)

            rows.append({
                "crop_name": crop,
                "market_name": "Synthetic Reference Market",
                "state": "All India",
                "price_date": date.strftime("%Y-%m-%d"),
                "min_price_per_kg": round(min_price, 2),
                "max_price_per_kg": round(max_price, 2),
                "modal_price_per_kg": round(modal_price, 2),
            })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    print("Generating historical crop price dataset (3 years, weekly, 15 crops)...")
    df = generate_dataset()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(svc.DATASET_PATH, index=False)
    print(f"Dataset saved: {svc.DATASET_PATH} ({len(df)} rows)")

    print("Training XGBoost regressor...")
    svc.train_and_save()
    print(f"Model saved: {svc.MODEL_PATH}")
    print("Done.")
