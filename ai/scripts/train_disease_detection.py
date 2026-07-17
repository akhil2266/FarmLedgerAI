"""
Trains the CNN used by app/services/disease_detection_service.py.

--- IMPORTANT: ABOUT THE TRAINING DATA ---
This script supports two modes:

1. REAL DATASET (recommended for production accuracy):
   Place labeled folders of leaf images under:
     ai/data/plant_disease_dataset/<class_name>/*.jpg
   e.g. ai/data/plant_disease_dataset/healthy/*.jpg
        ai/data/plant_disease_dataset/bacterial_blight/*.jpg
   A great free source for this is the PlantVillage dataset (~54,000 labeled leaf
   images across many crops/diseases) — search "PlantVillage dataset" and download
   it into the path above with folders renamed to match TREATMENT_MAP keys in
   app/services/disease_detection_service.py.

2. SYNTHETIC FALLBACK (used automatically if no real dataset is found):
   Generates procedurally-colored/textured synthetic leaf-like images so the full
   CNN training + inference pipeline is genuinely trainable and testable end-to-end
   without requiring an internet download. This validates the architecture and API
   contract, but will NOT produce clinically accurate disease predictions — swap in
   the real dataset above before relying on this in production.

Usage:
    cd ai
    python scripts/train_disease_detection.py
"""
import sys
import json
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

import numpy as np
import cv2
from app.config import settings
from app.services.disease_detection_service import MODEL_PATH, CLASS_INDEX_PATH, IMG_SIZE, TREATMENT_MAP

REAL_DATASET_DIR = settings.data_dir / "plant_disease_dataset"
SYNTHETIC_DIR = settings.data_dir / "synthetic_disease_dataset"
CLASSES = list(TREATMENT_MAP.keys())  # healthy, bacterial_blight, leaf_rust, ...
IMAGES_PER_CLASS_SYNTHETIC = 40


def _generate_synthetic_dataset():
    """
    Creates procedurally generated images per class with distinguishing color/texture
    signatures (e.g. healthy = uniform green, bacterial_blight = green with dark brown
    blotches, mosaic_virus = mottled yellow-green patchwork) so a CNN has a genuinely
    learnable signal to validate the pipeline against.
    """
    print(f"No real dataset found at {REAL_DATASET_DIR}. Generating synthetic placeholder dataset...")
    rng = np.random.default_rng(42)

    color_signatures = {
        "healthy": ((30, 90, 30), 5),
        "bacterial_blight": ((40, 80, 20), 35),
        "leaf_rust": ((60, 110, 140), 30),
        "powdery_mildew": ((200, 200, 200), 40),
        "early_blight": ((90, 70, 40), 30),
        "leaf_spot": ((50, 90, 40), 45),
        "mosaic_virus": ((60, 160, 60), 50),
        "root_rot": ((60, 45, 30), 25),
    }

    for class_name in CLASSES:
        class_dir = SYNTHETIC_DIR / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        base_color, blotch_intensity = color_signatures.get(class_name, ((60, 100, 60), 20))

        for i in range(IMAGES_PER_CLASS_SYNTHETIC):
            img = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
            base = np.array(base_color, dtype=np.int16)
            noise = rng.integers(-15, 15, size=(IMG_SIZE, IMG_SIZE, 3))
            img[:, :] = np.clip(base + noise, 0, 255).astype(np.uint8)

            # Add class-characteristic blotches/spots
            num_blotches = rng.integers(3, 12)
            for _ in range(num_blotches):
                cx, cy = rng.integers(0, IMG_SIZE, size=2)
                radius = rng.integers(3, blotch_intensity // 2 + 4)
                blotch_color = np.clip(base - rng.integers(20, 60, size=3), 0, 255).tolist()
                cv2.circle(img, (int(cx), int(cy)), int(radius), blotch_color, -1)

            img = cv2.GaussianBlur(img, (3, 3), 0)
            cv2.imwrite(str(class_dir / f"{class_name}_{i}.jpg"), img)

    print(f"Synthetic dataset generated at {SYNTHETIC_DIR}")
    return SYNTHETIC_DIR


def _load_dataset(dataset_dir: Path):
    images, labels = [], []
    class_names = sorted([d.name for d in dataset_dir.iterdir() if d.is_dir()])

    for label_idx, class_name in enumerate(class_names):
        class_dir = dataset_dir / class_name
        for img_path in class_dir.glob("*.*"):
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            images.append(img.astype("float32") / 255.0)
            labels.append(label_idx)

    return np.array(images), np.array(labels), class_names


def build_cnn(num_classes: int):
    from tensorflow import keras
    from tensorflow.keras import layers

    model = keras.Sequential([
        layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        layers.Conv2D(32, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Conv2D(64, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Conv2D(128, 3, activation="relu", padding="same"),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.4),
        layers.Dense(num_classes, activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


if __name__ == "__main__":
    dataset_dir = REAL_DATASET_DIR if REAL_DATASET_DIR.exists() and any(REAL_DATASET_DIR.iterdir()) else _generate_synthetic_dataset()

    print(f"Loading images from {dataset_dir} ...")
    X, y, class_names = _load_dataset(dataset_dir)
    print(f"Loaded {len(X)} images across {len(class_names)} classes: {class_names}")

    # Simple train/validation split
    indices = np.random.default_rng(42).permutation(len(X))
    split = int(len(X) * 0.85)
    train_idx, val_idx = indices[:split], indices[split:]
    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]

    print("Building CNN...")
    model = build_cnn(num_classes=len(class_names))
    model.summary()

    print("Training...")
    model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=5, batch_size=16)
    settings.model_dir.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    with open(CLASS_INDEX_PATH, "w") as f:
        json.dump({str(i): name for i, name in enumerate(class_names)}, f, indent=2)

    print(f"Model saved: {MODEL_PATH}")
    print(f"Class index saved: {CLASS_INDEX_PATH}")
    print("Done. NOTE: if trained on the synthetic fallback dataset, replace with a real")
    print("labeled leaf-image dataset (e.g. PlantVillage) before production use.")
