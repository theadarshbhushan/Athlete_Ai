from typing import Any, Optional

from fastapi import HTTPException


def success_response(data: Any, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}


def error_response(message: str, status_code: int = 400) -> None:
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "message": message, "data": None},
    )
