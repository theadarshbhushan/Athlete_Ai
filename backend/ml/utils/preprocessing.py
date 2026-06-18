import numpy as np


def build_feature_vector(features: dict, feature_order: list[str] | None = None) -> np.ndarray:
    """Build a numpy feature vector from a dict in consistent order."""
    if feature_order is None:
        feature_order = sorted(features.keys())
    return np.array([[features[k] for k in feature_order]])
