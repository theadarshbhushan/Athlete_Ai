from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    sleep_hours: float
    resting_hr: int
    workout_intensity: int = Field(ge=1, le=10)
    training_load: float
    soreness: int = Field(ge=1, le=10)
    prev_day_workout: int = Field(ge=0, le=1)  # 0 or 1
    energy_level: int = Field(ge=1, le=10)
