from typing import Optional

from fastapi import APIRouter, Depends, Query

from schemas.workout_schema import WorkoutLog
from services import workout_service
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("")
async def log_workout(
    workout: WorkoutLog,
    current_user: dict = Depends(get_current_user),
):
    doc = {
        "user_id": current_user["id"],
        "date": workout.date,
        "type": workout.type,
        "exercise": workout.exercise,
        "sets": workout.sets,
        "reps": workout.reps,
        "weight_kg": workout.weight_kg,
        "duration_min": workout.duration_min,
        "intensity": workout.intensity,
        "soreness": workout.soreness,
        "mood": workout.mood,
        "calories_burned": workout.calories_burned,
        "notes": workout.notes,
        "distance_km": workout.distance_km,
        "pace": workout.pace,
        "match_result": workout.match_result,
        "flexibility_focus": workout.flexibility_focus,
        "recovery_activity": workout.recovery_activity,
        "training_load": (workout.duration_min or 0) * (workout.intensity or 1),
    }
    workout = await workout_service.create_workout(
        current_user["id"], doc
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
