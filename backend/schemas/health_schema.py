from typing import Optional

from pydantic import BaseModel, Field


class HealthMetrics(BaseModel):
    date: str
    steps: Optional[int] = None
    sleep_hours: float
    resting_hr: int
    calories_burned: Optional[int] = None
    water_intake_L: Optional[float] = None
    energy_level: int = Field(ge=1, le=10)
