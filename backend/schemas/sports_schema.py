from typing import Optional

from pydantic import BaseModel, Field


class SportsSession(BaseModel):
    date: str
    sport: str
    duration_min: int
    intensity: int = Field(ge=1, le=10)
    result: Optional[str] = None  # win / loss / practice
    sets_won: Optional[int] = None
    notes: Optional[str] = None
