from typing import Optional

from pydantic import BaseModel, Field


class WorkoutLog(BaseModel):
    date: str  # ISO date string e.g. "2026-06-17"
    type: str  # gym / running / sport / mobility / rest
    exercise: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    duration_min: int
    intensity: int = Field(ge=1, le=10)
    soreness: int = Field(ge=1, le=10)
    mood: int = Field(ge=1, le=10)
    calories_burned: Optional[int] = None
    notes: Optional[str] = None
