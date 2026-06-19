from fastapi import APIRouter, Depends

from schemas.user_schema import PasswordUpdate, UserUpdate
from services import auth_service
from utils.jwt_handler import get_current_user
from utils.response_handler import error_response, success_response

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return success_response(current_user, "Profile retrieved")


@router.put("/profile")
async def update_profile(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    updated = await auth_service.update_user_profile(
        current_user["id"], payload.model_dump(exclude_unset=True, exclude_none=True)
    )
    return success_response(updated, "Profile updated successfully")


@router.put("/password")
async def update_password(
    payload: PasswordUpdate,
    current_user: dict = Depends(get_current_user),
):
    success = await auth_service.update_password(
        current_user["id"],
        payload.current_password,
        payload.new_password,
    )
    if not success:
        error_response("Current password is incorrect", 400)
    return success_response(None, "Password updated successfully")
