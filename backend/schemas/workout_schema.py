from typing import Optional

from pydantic import BaseModel, Field


class WorkoutLog(BaseModel):
    date: str
    type: str
    exercise: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    duration_min: Optional[int] = None
    intensity: Optional[int] = None
    soreness: Optional[int] = None
    mood: Optional[int] = None
    calories_burned: Optional[int] = None
    notes: Optional[str] = None
    distance_km: Optional[float] = None
    pace: Optional[str] = None
    match_result: Optional[str] = None
    flexibility_focus: Optional[str] = None
    recovery_activity: Optional[str] = None
