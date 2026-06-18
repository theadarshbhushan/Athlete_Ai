from typing import Optional

from pydantic import BaseModel


class BodyFatManual(BaseModel):
    height_cm: float
    weight_kg: float
    age: int
    gender: str
    neck_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
