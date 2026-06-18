from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from database.db import predictions_col
from ml.prediction.fatigue_predictor import predict_fatigue
from schemas.prediction_schema import PredictionInput
from services.injury_risk_service import get_injury_prediction
from services.recommendation_service import get_workout_recommendation
from services.recovery_service import predict_recovery
from services.smartwatch_service import get_health_for_date
from services.training_load_service import get_weekly_load
from services.workout_service import get_latest_workout, get_workouts_in_range
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/fatigue")
async def predict_fatigue_endpoint(payload: PredictionInput):
    result = predict_fatigue(
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        energy_level=payload.energy_level,
        training_load=payload.training_load,
        resting_hr=payload.resting_hr,
        workout_intensity=payload.workout_intensity,
        prev_day_workout=payload.prev_day_workout,
    )
    return success_response(result, "Fatigue prediction complete")


@router.post("/recovery")
async def predict_recovery_endpoint(payload: PredictionInput):
    result = predict_recovery(
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        resting_hr=payload.resting_hr,
        training_load=payload.training_load,
        energy_level=payload.energy_level,
    )
    return success_response(result, "Recovery prediction complete")


@router.post("/injury-risk")
async def predict_injury_endpoint(payload: PredictionInput):
    prev_load = payload.training_load * 0.85
    result = get_injury_prediction(
        training_load=payload.training_load,
        prev_load=prev_load,
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        resting_hr=payload.resting_hr,
        energy_level=payload.energy_level,
    )
    return success_response(result, "Injury risk prediction complete")


@router.post("/recommend")
async def recommend_workout(payload: PredictionInput):
    fatigue = predict_fatigue(
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        energy_level=payload.energy_level,
        training_load=payload.training_load,
        resting_hr=payload.resting_hr,
        workout_intensity=payload.workout_intensity,
        prev_day_workout=payload.prev_day_workout,
    )
    recovery = predict_recovery(
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        resting_hr=payload.resting_hr,
        training_load=payload.training_load,
        energy_level=payload.energy_level,
    )
    injury = get_injury_prediction(
        training_load=payload.training_load,
        prev_load=payload.training_load * 0.85,
        sleep_hours=payload.sleep_hours,
        soreness=payload.soreness,
        resting_hr=payload.resting_hr,
        energy_level=payload.energy_level,
    )
    recommendation, reason = get_workout_recommendation(
        fatigue["fatigue_status"],
        recovery["recovery_score"],
        injury["injury_risk"],
        "gym",
        "performance",
    )
    return success_response(
        {"recommendation": recommendation, "reason": reason},
        "Recommendation generated",
    )


@router.get("/today")
async def predict_today(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    today = datetime.now(timezone.utc).date().isoformat()
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()

    health = await get_health_for_date(user_id, today)
    workout = await get_latest_workout(user_id, today)

    sleep_hours = health.get("sleep_hours", 7) if health else 7
    resting_hr = health.get("resting_hr", 70) if health else 70
    energy_level = health.get("energy_level", 5) if health else 5
    soreness = workout.get("soreness", 5) if workout else 5
    training_load = workout.get("training_load", 0) if workout else 0
    intensity = workout.get("intensity", 5) if workout else 5

    week_start = (
        datetime.now(timezone.utc).date()
        - timedelta(days=datetime.now(timezone.utc).date().weekday())
    ).isoformat()
    week_workouts = await get_workouts_in_range(user_id, week_start, today)
    current_week_load = get_weekly_load(week_workouts)

    prev_week_start = (
        datetime.now(timezone.utc).date() - timedelta(days=7)
    ).isoformat()
    prev_week_end = (
        datetime.now(timezone.utc).date() - timedelta(days=1)
    ).isoformat()
    prev_week_workouts = await get_workouts_in_range(
        user_id, prev_week_start, prev_week_end
    )
    prev_week_load = get_weekly_load(prev_week_workouts)

    yesterday_workout = await get_latest_workout(user_id, yesterday)
    prev_day_workout = 1 if yesterday_workout else 0

    fatigue = predict_fatigue(
        sleep_hours, soreness, energy_level, training_load,
        resting_hr, intensity, prev_day_workout,
    )
    recovery = predict_recovery(
        sleep_hours, soreness, resting_hr, training_load, energy_level
    )
    injury = get_injury_prediction(
        current_week_load, prev_week_load, sleep_hours, soreness,
        pain_level=soreness if soreness >= 7 else 0,
        resting_hr=resting_hr, energy_level=energy_level,
    )
    recommendation, reason = get_workout_recommendation(
        fatigue["fatigue_status"],
        recovery["recovery_score"],
        injury["injury_risk"],
        current_user.get("sport", "gym"),
        current_user.get("goal", "performance"),
    )

    prediction_doc = {
        "user_id": user_id,
        "date": today,
        "fatigue_status": fatigue["fatigue_status"],
        "fatigue_confidence": fatigue["confidence"],
        "recovery_score": recovery["recovery_score"],
        "recovery_advice": recovery["advice"],
        "injury_risk": injury["injury_risk"],
        "injury_reasons": injury["reasons"],
        "recommendation": recommendation,
        "recommendation_reason": reason,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    await predictions_col.update_one(
        {"user_id": user_id, "date": today},
        {"$set": prediction_doc},
        upsert=True,
    )

    return success_response(prediction_doc, "Today's predictions generated")


@router.get("/history")
async def prediction_history(current_user: dict = Depends(get_current_user)):
    start_date = (datetime.now(timezone.utc).date() - timedelta(days=29)).isoformat()
    cursor = predictions_col.find(
        {"user_id": current_user["id"], "date": {"$gte": start_date}}
    ).sort("date", -1)

    history = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        history.append(doc)

    return success_response(history, "Prediction history retrieved")
