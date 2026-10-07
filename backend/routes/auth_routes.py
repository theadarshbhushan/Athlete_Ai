import logging
from fastapi import APIRouter, Depends, HTTPException

from schemas.user_schema import UserLogin, UserRegister
from services import auth_service
from utils.jwt_handler import create_access_token, get_current_user
from utils.response_handler import error_response, success_response

logger = logging.getLogger("athlete_ai.auth_routes")

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(payload: UserRegister):
    try:
        user = await auth_service.register_user(payload.model_dump())
        token = create_access_token({"sub": user["id"]})
        return success_response(
            {"token": token, "user": user},
            "Registration successful",
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Registration failure for {payload.email}: {exc}", exc_info=True)
        error_response(f"Registration failed: {str(exc)}", 500)


@router.post("/login")
async def login(payload: UserLogin):
    user = await auth_service.login_user(payload.email, payload.password)
    if not user:
        error_response("Invalid email or password", 401)
    token = create_access_token({"sub": user["id"]})
    return success_response(
        {"token": token, "user": user},
        "Login successful",
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return success_response(current_user, "User retrieved")


@router.post("/logout")
async def logout():
    return success_response(None, "Logged out successfully")
