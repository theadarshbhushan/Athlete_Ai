from ml.utils.model_loader import load_model


def predict_injury_risk_fallback(
    training_load: float,
    prev_load: float,
    sleep_hours: float,
    soreness: int,
    pain_level: int,
) -> tuple[str, list[str]]:
    reasons = []
    risk_score = 0
    load_spike = (training_load - prev_load) / max(prev_load, 1) * 100
    if load_spike > 30:
        risk_score += 2
        reasons.append(f"Training load increased by {round(load_spike)}%")
    if sleep_hours < 6:
        risk_score += 1
        reasons.append("Sleep below 6 hours")
    if soreness >= 7:
        risk_score += 2
        reasons.append("High muscle soreness")
    if pain_level >= 6:
        risk_score += 2
        reasons.append("Reported joint/muscle pain")
    if risk_score >= 4:
        return "High", reasons
    elif risk_score >= 2:
        return "Medium", reasons
    return "Low", reasons


def predict_injury_risk(
    training_load: float,
    prev_load: float,
    sleep_hours: float,
    soreness: int,
    pain_level: int = 0,
    resting_hr: int = 70,
    energy_level: int = 5,
) -> dict:
    model = load_model("injury_model.pkl")

    if model is not None:
        try:
            features = [
                [
                    training_load,
                    prev_load,
                    sleep_hours,
                    soreness,
                    pain_level,
                    resting_hr,
                    energy_level,
                ]
            ]
            prediction = model.predict(features)[0]
            from config.constants import INJURY_RISK_LABELS

            if isinstance(prediction, (int, float)):
                idx = int(prediction)
                risk = INJURY_RISK_LABELS[idx] if 0 <= idx < len(INJURY_RISK_LABELS) else str(prediction)
            else:
                risk = str(prediction)

            _, reasons = predict_injury_risk_fallback(
                training_load, prev_load, sleep_hours, soreness, pain_level
            )
            return {"injury_risk": risk, "reasons": reasons}
        except Exception:
            pass

    risk, reasons = predict_injury_risk_fallback(
        training_load, prev_load, sleep_hours, soreness, pain_level
    )
    return {"injury_risk": risk, "reasons": reasons}
