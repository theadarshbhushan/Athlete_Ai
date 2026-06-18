from fastapi import APIRouter, Depends, Query

from schemas.health_schema import HealthMetrics
from services import smartwatch_service
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/health", tags=["Health"])


@router.post("/metrics")
async def log_metrics(
    payload: HealthMetrics,
    current_user: dict = Depends(get_current_user),
):
    record = await smartwatch_service.log_health_metrics(
        current_user["id"], payload.model_dump()
    )
    return success_response(record, "Health metrics logged")


@router.get("/metrics/today")
async def get_today_metrics(current_user: dict = Depends(get_current_user)):
    record = await smartwatch_service.get_today_metrics(current_user["id"])
    return success_response(record, "Today's metrics retrieved")


@router.get("/metrics/history")
async def get_metrics_history(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    history = await smartwatch_service.get_metrics_history(current_user["id"], days)
    return success_response(history, "Metrics history retrieved")


@router.get("/sleep/trend")
async def sleep_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    trend = await smartwatch_service.get_sleep_trend(current_user["id"], days)
    return success_response(trend, "Sleep trend retrieved")


@router.get("/heart-rate/trend")
async def heart_rate_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    trend = await smartwatch_service.get_heart_rate_trend(current_user["id"], days)
    return success_response(trend, "Heart rate trend retrieved")
