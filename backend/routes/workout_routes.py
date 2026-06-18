from typing import Optional

from fastapi import APIRouter, Depends, Query

from schemas.workout_schema import WorkoutLog
from services import workout_service
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("")
async def log_workout(
    payload: WorkoutLog,
    current_user: dict = Depends(get_current_user),
):
    workout = await workout_service.create_workout(
        current_user["id"], payload.model_dump()
    )
    return success_response(workout, "Workout logged")


@router.get("")
async def list_workouts(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    workouts = await workout_service.get_workouts(
        current_user["id"], start_date, end_date
    )
    return success_response(workouts, "Workouts retrieved")


@router.get("/summary/weekly")
async def weekly_summary(current_user: dict = Depends(get_current_user)):
    summary = await workout_service.get_weekly_summary(current_user["id"])
    return success_response(summary, "Weekly summary retrieved")


@router.get("/{workout_id}")
async def get_workout(
    workout_id: str,
    current_user: dict = Depends(get_current_user),
):
    workout = await workout_service.get_workout_by_id(current_user["id"], workout_id)
    return success_response(workout, "Workout retrieved")


@router.put("/{workout_id}")
async def update_workout(
    workout_id: str,
    payload: WorkoutLog,
    current_user: dict = Depends(get_current_user),
):
    workout = await workout_service.update_workout(
        current_user["id"], workout_id, payload.model_dump()
    )
    return success_response(workout, "Workout updated")


@router.delete("/{workout_id}")
async def delete_workout(
    workout_id: str,
    current_user: dict = Depends(get_current_user),
):
    await workout_service.delete_workout(current_user["id"], workout_id)
    return success_response(None, "Workout deleted")
