def calculate_recovery_score(sleep_hours, soreness, resting_hr, training_load, energy_level):
    score = 0
    score += min(sleep_hours / 8 * 35, 35)
    score += max(0, (10 - soreness) / 10 * 25)
    hr_score = max(0, (80 - resting_hr) / 30 * 20)
    score += min(hr_score, 20)
    score += energy_level / 10 * 20
    if training_load > 500:
        score -= 10
    return round(min(max(score, 0), 100))


def get_recovery_advice(score):
    if score >= 80:
        return "Great recovery! You can train hard today."
    elif score >= 60:
        return "Good recovery. Moderate intensity training recommended."
    elif score >= 40:
        return "Moderate recovery. Choose light cardio or mobility."
    else:
        return "Low recovery. Rest day or very light activity recommended."