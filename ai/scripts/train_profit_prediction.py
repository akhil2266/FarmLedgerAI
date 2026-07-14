"""
Generates a synthetic profit-prediction training dataset (crop, soil, season, area,
cost -> actual yield) with realistic diminishing-returns cost-to-yield relationships,
and trains the XGBoost regressor used by app/services/profit_prediction_service.py.

Usage:
    cd ai
    python scripts/train_profit_prediction.py
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
from app.config import settings
from app.services import profit_prediction_service as svc

np.random.seed(42)

# crop -> (base yield per acre in kg at reference cost, reference cost per acre)
CROP_YIELD_PROFILE = {
    "rice": (2800, 8000), "wheat": (2600, 9500), "maize": (2500, 7000), "cotton": (900, 10500),
    "sugarcane": (35000, 45000), "chickpea": (900, 5500), "soybean": (1100, 6000),
    "groundnut": (1200, 6500), "tomato": (18000, 9000), "onion": (16000, 8500),
    "potato": (20000, 10000), "banana": (28000, 18000), "mango": (6000, 12000),
    "turmeric": (7000, 16000), "chilli": (1300, 9500),
}
SOIL_TYPES = ["alluvial", "black", "red", "laterite", "arid", "loamy", "clay", "sandy", "silt"]
SEASONS = ["kharif", "rabi", "zaid", "perennial"]
SAMPLES_PER_CROP = 300


def generate_dataset():
    rows = []
    for crop, (base_yield_per_acre, ref_cost_per_acre) in CROP_YIELD_PROFILE.items():
        for _ in range(SAMPLES_PER_CROP):
            area = round(np.random.uniform(0.5, 25), 2)
            cost_multiplier = np.random.uniform(0.6, 1.6)
            estimated_cost = round(ref_cost_per_acre * area * cost_multiplier, 2)

            # Diminishing returns curve: yield scales with sqrt of relative investment,
            # capped by soil/season efficiency noise.
            investment_ratio = cost_multiplier
            efficiency = np.clip(np.random.normal(1.0, 0.12), 0.6, 1.3)
            yield_multiplier = np.sqrt(investment_ratio) * efficiency
            actual_yield_kg = round(base_yield_per_acre * area * yield_multiplier, 2)

            rows.append({
                "crop_name": crop,
                "soil_type": np.random.choice(SOIL_TYPES),
                "season": np.random.choice(SEASONS),
                "area_acres": area,
                "estimated_cost": estimated_cost,
                "actual_yield_kg": max(actual_yield_kg, 0),
            })

    return pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)


if __name__ == "__main__":
    print("Generating profit prediction dataset...")
    df = generate_dataset()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    df.to_csv(svc.DATASET_PATH, index=False)
    print(f"Dataset saved: {svc.DATASET_PATH} ({len(df)} rows)")

    print("Training XGBoost regressor...")
    svc.train_and_save()
    print(f"Model saved: {svc.MODEL_PATH}")
    print("Done.")
