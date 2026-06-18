def calculate_training_load(duration_min: int, intensity: int) -> float:
    return round(duration_min * intensity, 2)


def get_weekly_load(workouts: list) -> float:
    return sum(w.get("training_load", 0) for w in workouts)


def detect_load_spike(current_week_load: float, prev_week_load: float) -> float:
    if prev_week_load == 0:
        return 0
    return round((current_week_load - prev_week_load) / prev_week_load * 100, 1)
