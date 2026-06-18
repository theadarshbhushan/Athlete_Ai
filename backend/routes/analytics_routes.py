from fastapi import APIRouter, Depends, Query

from services import analytics_service
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/training-load")
async def training_load_analytics(
    weeks: int = Query(8, ge=1, le=52),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_training_load_weekly(current_user["id"], weeks)
    return success_response(data, "Training load analytics retrieved")


@router.get("/recovery-trend")
async def recovery_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_recovery_trend(current_user["id"], days)
    return success_response(data, "Recovery trend retrieved")


@router.get("/strength-progress")
async def strength_progress(current_user: dict = Depends(get_current_user)):
    data = await analytics_service.get_strength_progress(current_user["id"])
    return success_response(data, "Strength progress retrieved")


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
async def calories_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    data = await analytics_service.get_calories_trend(current_user["id"], days)
    return success_response(data, "Calories trend retrieved")


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
