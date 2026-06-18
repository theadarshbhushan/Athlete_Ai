from ml.utils.model_loader import load_model


def predict_fatigue_fallback(
    sleep_hours: float,
    soreness: int,
    energy_level: int,
    training_load: float,
) -> str:
    if sleep_hours < 5 or soreness >= 8 or training_load > 700:
        return "Overtrained"
    elif sleep_hours < 6.5 or soreness >= 6 or training_load > 500:
        return "Fatigued"
    elif sleep_hours >= 7.5 and soreness <= 3 and energy_level >= 7:
        return "Fresh"
    else:
        return "Normal"


def predict_fatigue(
    sleep_hours: float,
    soreness: int,
    energy_level: int,
    training_load: float,
    resting_hr: int = 70,
    workout_intensity: int = 5,
    prev_day_workout: int = 0,
) -> dict:
    model = load_model("fatigue_model.pkl")

    if model is not None:
        try:
            features = [
                [
                    sleep_hours,
                    soreness,
                    energy_level,
                    training_load,
                    resting_hr,
                    workout_intensity,
                    prev_day_workout,
                ]
            ]
            prediction = model.predict(features)[0]
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(features)[0]
                confidence = round(float(max(proba)) * 100, 1)
            else:
                confidence = 75.0

            label = prediction
            if isinstance(prediction, (int, float)):
                from config.constants import FATIGUE_LABELS
                idx = int(prediction)
                label = FATIGUE_LABELS[idx] if 0 <= idx < len(FATIGUE_LABELS) else str(prediction)

            return {"fatigue_status": str(label), "confidence": confidence}
        except Exception:
            pass

    status = predict_fatigue_fallback(sleep_hours, soreness, energy_level, training_load)
    return {"fatigue_status": status, "confidence": 70.0}
