import math


def get_best_estimate(gender: str, height_cm: float, weight_kg: float,
                      age: int, waist_cm: float = None, neck_cm: float = None,
                      hip_cm: float = None):

    results = []

    # Navy formula
    try:
        if waist_cm and neck_cm and waist_cm > neck_cm:
            if gender.lower() == "male":
                bf = 495 / (1.0324 - 0.19077 * math.log10(waist_cm - neck_cm) + 0.15456 * math.log10(height_cm)) - 450
            else:
                h = hip_cm if hip_cm else waist_cm * 1.1
                bf = 495 / (1.29579 - 0.35004 * math.log10(waist_cm + h - neck_cm) + 0.22100 * math.log10(height_cm)) - 450
            if 3 < bf < 50:
                results.append(round(bf, 1))
    except Exception:
        pass

    # BMI formula (always works)
    try:
        bmi = weight_kg / ((height_cm / 100) ** 2)
        if gender.lower() == "male":
            bf = (1.20 * bmi) + (0.23 * age) - 16.2
        else:
            bf = (1.20 * bmi) + (0.23 * age) - 5.4
        bf = max(3.0, min(bf, 50.0))
        results.append(round(bf, 1))
    except Exception:
        pass

    if not results:
        return 15.0  # safe default

    return round(sum(results) / len(results), 1)


def get_bodyfat_range(bf_estimate: float):
    return {
        "range_low": round(bf_estimate - 2, 1),
        "range_high": round(bf_estimate + 2, 1),
        "estimate": bf_estimate,
        "confidence": "Medium"
    }


def get_bodyfat_category(bf: float, gender: str):
    if gender.lower() == "male":
        if bf < 6:
            return "Essential Fat"
        elif bf < 14:
            return "Athletic"
        elif bf < 18:
            return "Fitness"
        elif bf < 25:
            return "Average"
        else:
            return "Obese"
    else:
        if bf < 14:
            return "Essential Fat"
        elif bf < 21:
            return "Athletic"
        elif bf < 25:
            return "Fitness"
        elif bf < 32:
            return "Average"
        else:
            return "Obese"