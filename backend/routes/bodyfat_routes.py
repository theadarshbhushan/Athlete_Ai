from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile

from database.db import bodyfat_col
from ml.prediction.bodyfat_estimator import (
    estimate_bodyfat_navy,
    estimate_bodyfat_bmi,
    get_bodyfat_range,
    get_bodyfat_category
)
from schemas.bodyfat_schema import BodyFatManual
from utils.jwt_handler import get_current_user
from utils.response_handler import error_response, success_response

router = APIRouter(prefix="/bodyfat", tags=["Body Fat"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "body_photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/estimate")
async def estimate_bodyfat(data: BodyFatManual, current_user=Depends(get_current_user)):
    # Try Navy formula first
    bf = estimate_bodyfat_navy(
        gender=data.gender,
        height_cm=data.height_cm,
        waist_cm=data.waist_cm,
        neck_cm=data.neck_cm,
        hip_cm=data.hip_cm
    )
    
    # Fallback to BMI formula if Navy fails
    if bf is None:
        bf = estimate_bodyfat_bmi(
            weight_kg=data.weight_kg,
            height_cm=data.height_cm,
            age=data.age,
            gender=data.gender
        )
    
    result = get_bodyfat_range(bf)
    result["category"] = get_bodyfat_category(bf, data.gender)
    
    # Save to database
    doc = {
        "user_id": current_user["_id"],
        "date": str(date.today()),
        "method": "manual",
        "range_low": result["range_low"],
        "range_high": result["range_high"],
        "estimate": bf,
        "confidence": result["confidence"],
        "category": result["category"]
    }
    await bodyfat_col.insert_one(doc)
    
    return success_response(result, "Body fat estimated successfully")


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
