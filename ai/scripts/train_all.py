"""
Trains all FarmLedger AI models in sequence:
  1. Crop recommendation (RandomForest)
  2. Profit prediction (XGBoost)
  3. Price prediction (XGBoost, time-series features)
  4. Disease detection (CNN)

Usage:
    cd ai
    python scripts/train_all.py
"""
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
SCRIPTS = [
    "train_crop_recommendation.py",
    "train_profit_prediction.py",
    "train_price_prediction.py",
    "train_disease_detection.py",
]

if __name__ == "__main__":
    for script in SCRIPTS:
        print("=" * 70)
        print(f"Running {script}")
        print("=" * 70)
        result = subprocess.run([sys.executable, str(SCRIPTS_DIR / script)])
        if result.returncode != 0:
            print(f"FAILED: {script} exited with code {result.returncode}")
            sys.exit(result.returncode)
    print("=" * 70)
    print("All models trained successfully. Trained artifacts are in ai/trained_models/")
    print("=" * 70)
