import math

def estimate_bodyfat_navy(gender: str, height_cm: float, waist_cm: float, 
                           neck_cm: float, hip_cm: float = None):
    try:
        if gender.lower() == "male":
            # US Navy formula for men
            log_diff = math.log10(waist_cm - neck_cm)
            log_height = math.log10(height_cm)
            bf = 495 / (1.0324 - 0.19077 * log_diff + 0.15456 * log_height) - 450
        else:
            # US Navy formula for women (needs hip measurement)
            if not hip_cm:
                hip_cm = waist_cm * 1.1  # fallback estimate
            log_sum = math.log10(waist_cm + hip_cm - neck_cm)
            log_height = math.log10(height_cm)
            bf = 495 / (1.29579 - 0.35004 * log_sum + 0.22100 * log_height) - 450

        # Clamp to realistic range
        bf = max(3.0, min(bf, 50.0))
        return round(bf, 1)

    except (ValueError, ZeroDivisionError):
        # Fallback to BMI-based estimate
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