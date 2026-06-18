import os
from pathlib import Path

import joblib

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"


def load_model(model_name: str):
    """Load a joblib model from ml/models/. Returns None if file not found."""
    model_path = MODELS_DIR / model_name
    if not os.path.exists(model_path):
        return None
    try:
        return joblib.load(model_path)
    except Exception:
        return None
