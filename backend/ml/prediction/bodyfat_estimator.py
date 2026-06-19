import math

def estimate_bodyfat_navy(gender: str, height_cm: float, waist_cm: float,
                           neck_cm: float, hip_cm: float = None):
    try:
        if waist_cm <= neck_cm:
            return None  # Navy formula invalid if waist <= neck
        
        if gender.lower() == "male":
            diff = waist_cm - neck_cm
            if diff <= 0:
                return None
            bf = 495 / (1.0324 - 0.19077 * math.log10(diff) + 0.15456 * math.log10(height_cm)) - 450
        else:
            if not hip_cm:
                hip_cm = waist_cm * 1.1
            total = waist_cm + hip_cm - neck_cm
            if total <= 0:
                return None
            bf = 495 / (1.29579 - 0.35004 * math.log10(total) + 0.22100 * math.log10(height_cm)) - 450

        if bf < 3 or bf > 50:
            return None
        return round(bf, 1)

    except (ValueError, ZeroDivisionError):
        return None


def estimate_bodyfat_bmi(weight_kg: float, height_cm: float,
                          age: int, gender: str):
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    if gender.lower() == "male":
        bf = (1.20 * bmi) + (0.23 * age) - 16.2
    else:
        bf = (1.20 * bmi) + (0.23 * age) - 5.4

    bf = max(3.0, min(bf, 50.0))
    return round(bf, 1)


def estimate_bodyfat_army(gender: str, height_cm: float, waist_cm: float,
                           neck_cm: float, hip_cm: float = None):
    """US Army formula - more forgiving than Navy"""
    try:
        if gender.lower() == "male":
            bf = 86.010 * math.log10(waist_cm - neck_cm) - 70.041 * math.log10(height_cm) + 36.76
        else:
            if not hip_cm:
                hip_cm = waist_cm * 1.1
            bf = 163.205 * math.log10(waist_cm + hip_cm - neck_cm) - 97.684 * math.log10(height_cm) - 78.387

        if bf < 3 or bf > 50:
            return None
        return round(bf, 1)
    except (ValueError, ZeroDivisionError):
        return None


def get_best_estimate(gender: str, height_cm: float, weight_kg: float,
                       age: int, waist_cm: float = None, neck_cm: float = None,
                       hip_cm: float = None):
    """Try all formulas and return best result"""
    results = []

    # Try Navy formula
    if waist_cm and neck_cm:
        navy = estimate_bodyfat_navy(gender, height_cm, waist_cm, neck_cm, hip_cm)
        if navy:
            results.append(navy)

        # Try Army formula
        army = estimate_bodyfat_army(gender, height_cm, waist_cm, neck_cm, hip_cm)
        if army:
            results.append(army)

    # Always include BMI method
    bmi_result = estimate_bodyfat_bmi(weight_kg, height_cm, age, gender)
    results.append(bmi_result)

    if len(results) > 1:
        # Average all valid results for better accuracy
        return round(sum(results) / len(results), 1)
    return results[0]


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