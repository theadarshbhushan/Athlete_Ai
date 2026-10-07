from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, description="Full Name")
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    age: int = Field(..., gt=0, le=120)
    height: float = Field(..., gt=0)  # cm
    weight: float = Field(..., gt=0)  # kg
    gender: str = "male"  # male / female
    sport: str = "badminton"  # badminton / running / gym / cycling / other
    goal: str = "fat loss"  # fat loss / muscle gain / performance / endurance


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    sport: Optional[str] = None
    goal: Optional[str] = None
    gender: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
