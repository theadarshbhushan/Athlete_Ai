from fastapi import APIRouter, Depends, Query

from database.db import workouts_col
from services import analytics_service
from utils.jwt_handler import get_current_user
from utils.response_handler import error_response
from utils.response_handler import success_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/training-load")
async def get_training_load(
    weeks: int = Query(8, ge=1, le=52),
    current_user=Depends(get_current_user),
):
    try:
        data = await analytics_service.get_training_load_weekly(
            current_user["id"], weeks
        )
        return success_response(data, "Training load retrieved")
    except Exception as e:
        return error_response(str(e), 500)


@router.get("/recovery-trend")
async def recovery_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_recovery_trend(current_user["id"], days)
    return success_response(data, "Recovery trend retrieved")


@router.get("/strength-progress")
async def get_strength_progress(current_user=Depends(get_current_user)):
    try:
        cursor = workouts_col.find({
            "user_id": current_user["id"],
            "type": "gym",
            "weight_kg": {"$ne": None},
            "exercise": {"$ne": None}
        }).sort("date", 1)

        workouts = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            workouts.append(doc)

        # Group by exercise, get max weight per date
        exercise_data = {}
        for w in workouts:
            exercise = w.get("exercise", "Unknown")
            if exercise not in exercise_data:
                exercise_data[exercise] = []
            exercise_data[exercise].append({
                "date": w.get("date"),
                "weight": w.get("weight_kg"),
                "reps": w.get("reps"),
                "sets": w.get("sets")
            })

        # Format for frontend
        result = []
        for exercise, data in exercise_data.items():
            result.append({
                "exercise": exercise,
                "data": sorted(data, key=lambda x: x["date"])
            })

        return success_response(result, "Strength progress retrieved")

    except Exception as e:
        return error_response(str(e), 500)


@router.get("/workout-consistency")
async def workout_consistency(
    weeks: int = Query(8, ge=1, le=52),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_workout_consistency(current_user["id"], weeks)
    return success_response(data, "Workout consistency retrieved")


@router.get("/sleep-trend")
async def sleep_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_sleep_trend_analytics(current_user["id"], days)
    return success_response(data, "Sleep trend retrieved")


@router.get("/calories-trend")
async def get_calories_trend(current_user=Depends(get_current_user)):
    try:
        cursor = workouts_col.find({
            "user_id": current_user["id"],
            "calories_burned": {"$ne": None}
        }).sort("date", -1).limit(30)

        data = []
        async for doc in cursor:
            data.append({
                "date": doc.get("date"),
                "calories": doc.get("calories_burned", 0)
            })

        return success_response(
            sorted(data, key=lambda x: x["date"]),
            "Calories trend retrieved"
        )

    except Exception as e:
        return error_response(str(e), 500)


@router.get("/bodyfat-progress")
async def bodyfat_progress(current_user: dict = Depends(get_current_user)):
    data = await analytics_service.get_bodyfat_progress(current_user["id"])
    return success_response(data, "Body fat progress retrieved")


@router.get("/performance-score")
async def performance_score(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_performance_score(current_user["id"], days)
    return success_response(data, "Performance score retrieved")


@router.get("/dashboard-summary")
async def dashboard_summary(current_user: dict = Depends(get_current_user)):
    data = await analytics_service.get_dashboard_summary(
        current_user["id"], current_user
    )
    return success_response(data, "Dashboard summary retrieved")
