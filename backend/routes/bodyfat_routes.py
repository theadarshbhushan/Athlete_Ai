from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile

from database.db import bodyfat_col
from ml.prediction.bodyfat_estimator import estimate_bodyfat_from_photo, estimate_bodyfat_manual
from schemas.bodyfat_schema import BodyFatManual
from utils.jwt_handler import get_current_user
from utils.response_handler import error_response, success_response

router = APIRouter(prefix="/bodyfat", tags=["Body Fat"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "body_photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/estimate")
async def estimate_bodyfat(
    payload: BodyFatManual,
    current_user: dict = Depends(get_current_user),
):
    data = payload.model_dump()
    result = estimate_bodyfat_manual(**data)

    doc = {
        "user_id": current_user["id"],
        "date": datetime.now(timezone.utc).date().isoformat(),
        **result,
        "method": result.get("method", "manual"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await bodyfat_col.insert_one(doc)
    doc.pop("_id", None)
    return success_response(result, "Body fat estimated")


@router.post("/photo")
async def estimate_from_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        error_response("File must be an image", 400)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user['id']}_{timestamp}.jpg"
    filepath = UPLOAD_DIR / filename

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    result = estimate_bodyfat_from_photo(
        str(filepath),
        gender=current_user.get("gender", "male"),
        height_cm=current_user.get("height", 170),
        weight_kg=current_user.get("weight", 70),
        age=current_user.get("age", 25),
    )

    doc = {
        "user_id": current_user["id"],
        "date": datetime.now(timezone.utc).date().isoformat(),
        "photo_path": str(filepath),
        **result,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_result = await bodyfat_col.insert_one(doc)
    doc["id"] = str(insert_result.inserted_id)
    doc.pop("_id", None)

    return success_response(result, "Body fat estimated from photo")


@router.get("/history")
async def bodyfat_history(current_user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {
            "$project": {
                "date": 1,
                "estimate": 1,
                "range_low": 1,
                "range_high": 1,
                "confidence": 1,
                "method": 1,
            }
        },
        {"$sort": {"date": -1}},
    ]
    history = await bodyfat_col.aggregate(pipeline).to_list(None)
    for item in history:
        if "_id" in item:
            item["id"] = str(item["_id"])
            item.pop("_id", None)
    return success_response(history, "Body fat history retrieved")
