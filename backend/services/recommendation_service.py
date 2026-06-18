def get_workout_recommendation(
    fatigue_status: str,
    recovery_score: int,
    injury_risk: str,
    sport: str,
    goal: str,
) -> tuple[str, str]:
    if injury_risk == "High":
        return "Rest day", "High injury risk detected. Do not train today."
    if fatigue_status == "Overtrained":
        return "Rest day", "You are overtrained. Full rest required."
    if fatigue_status == "Fatigued" or recovery_score < 40:
        return "Mobility + light stretching", "Low recovery. Focus on mobility today."
    if recovery_score >= 80 and fatigue_status == "Fresh":
        if goal == "muscle gain":
            return "Heavy strength training", "Excellent recovery. Push maximum effort today."
        elif sport == "badminton":
            return "Badminton match practice", "Peak condition. Great day for competitive play."
        else:
            return "High intensity training", "You are fully recovered. Train hard today."
    if recovery_score >= 60:
        return "Moderate training", "Good recovery. Moderate intensity recommended."
    return "Light cardio", "Below average recovery. Keep it light today."
