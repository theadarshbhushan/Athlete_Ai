import math

from ml.utils.model_loader import load_model


def estimate_bodyfat_navy(
    gender: str,
    height_cm: float,
    waist_cm: float,
    neck_cm: float,
    hip_cm: float | None = None,
) -> float:
    if gender == "male":
        bf = (
            495
            / (
                1.0324
                - 0.19077 * math.log10(waist_cm - neck_cm)
                + 0.15456 * math.log10(height_cm)
            )
            - 450
        )
    else:
        bf = (
            495
            / (
                1.29579
                - 0.35004 * math.log10(waist_cm + hip_cm - neck_cm)
                + 0.22100 * math.log10(height_cm)
            )
            - 450
        )
    return round(bf, 1)


def estimate_bodyfat_bmi(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """BMI-based body fat estimate fallback."""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m**2)
    if gender == "male":
        bf = 1.20 * bmi + 0.23 * age - 16.2
    else:
        bf = 1.20 * bmi + 0.23 * age - 5.4
    return round(max(3.0, min(bf, 60.0)), 1)


def get_bodyfat_range(bf_estimate: float) -> dict:
    return {
        "range_low": round(bf_estimate - 2, 1),
        "range_high": round(bf_estimate + 2, 1),
        "confidence": "Medium",
    }


def estimate_bodyfat_manual(
    gender: str,
    height_cm: float,
    weight_kg: float,
    age: int,
    neck_cm: float | None = None,
    waist_cm: float | None = None,
    hip_cm: float | None = None,
) -> dict:
    model = load_model("bodyfat_model.pkl")

    if model is not None:
        try:
            features = [[height_cm, weight_kg, age, 1 if gender == "male" else 0]]
            if neck_cm and waist_cm:
                features[0].extend([neck_cm, waist_cm, hip_cm or 0])
            bf = float(model.predict(features)[0])
            result = get_bodyfat_range(bf)
            result["estimate"] = round(bf, 1)
            result["method"] = "ml_model"
            return result
        except Exception:
            pass

    if neck_cm and waist_cm and (gender == "male" or hip_cm):
        bf = estimate_bodyfat_navy(gender, height_cm, waist_cm, neck_cm, hip_cm)
        method = "navy_formula"
    else:
        bf = estimate_bodyfat_bmi(weight_kg, height_cm, age, gender)
        method = "bmi_fallback"

    result = get_bodyfat_range(bf)
    result["estimate"] = bf
    result["method"] = method
    return result


def estimate_bodyfat_from_photo(
    image_path: str,
    gender: str,
    height_cm: float,
    weight_kg: float,
    age: int,
) -> dict:
    """Attempt MediaPipe pose-based estimate; fall back to BMI."""
    try:
        import cv2
        import mediapipe as mp

        mp_pose = mp.solutions.pose
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image")

        with mp_pose.Pose(static_image_mode=True) as pose:
            results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            # Use shoulder-to-hip ratio as a rough body composition proxy
            shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
            hip_y = (landmarks[23].y + landmarks[24].y) / 2
            ratio = abs(hip_y - shoulder_y)
            if ratio > 0.15:
                bmi_bf = estimate_bodyfat_bmi(weight_kg, height_cm, age, gender)
                adjustment = -2 if ratio > 0.25 else 0
                bf = round(bmi_bf + adjustment, 1)
                result = get_bodyfat_range(bf)
                result["estimate"] = bf
                result["method"] = "mediapipe"
                result["confidence"] = "Medium"
                return result
    except Exception:
        pass

    bf = estimate_bodyfat_bmi(weight_kg, height_cm, age, gender)
    result = get_bodyfat_range(bf)
    result["estimate"] = bf
    result["method"] = "bmi_fallback"
    result["confidence"] = "Low"
    return result
