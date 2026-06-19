from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    height: float  # cm
    weight: float  # kg
    gender: str  # male / female
    sport: str  # badminton / running / gym / cycling / other
    goal: str  # fat loss / muscle gain / performance / endurance


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
