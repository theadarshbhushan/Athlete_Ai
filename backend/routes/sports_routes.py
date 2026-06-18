from fastapi import APIRouter, Depends

from schemas.sports_schema import SportsSession
from services import sports_service
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response

router = APIRouter(prefix="/sports", tags=["Sports"])


@router.post("/session")
async def log_session(
    payload: SportsSession,
    current_user: dict = Depends(get_current_user),
):
    session = await sports_service.create_sports_session(
        current_user["id"], payload.model_dump()
    )
    return success_response(session, "Sports session logged")


@router.get("/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    sessions = await sports_service.get_sports_sessions(current_user["id"])
    return success_response(sessions, "Sports sessions retrieved")


@router.get("/performance")
async def sports_performance(current_user: dict = Depends(get_current_user)):
    stats = await sports_service.get_sports_performance(current_user["id"])
    return success_response(stats, "Sports performance retrieved")
