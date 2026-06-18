from ml.prediction.recovery_predictor import calculate_recovery_score, get_recovery_advice


def predict_recovery(
    sleep_hours: float,
    soreness: int,
    resting_hr: int,
    training_load: float,
    energy_level: int,
) -> dict:
    score = calculate_recovery_score(
        sleep_hours, soreness, resting_hr, training_load, energy_level
    )
    advice = get_recovery_advice(score)
    return {"recovery_score": score, "advice": advice}
