from fastapi import APIRouter, Depends
from datetime import date
from database.db import bodyfat_col
from utils.jwt_handler import get_current_user
from utils.response_handler import success_response, error_response
from schemas.bodyfat_schema import BodyFatManual
from ml.prediction.bodyfat_estimator import (
    get_best_estimate,
    get_bodyfat_range,
    get_bodyfat_category
)

router = APIRouter(prefix="/bodyfat", tags=["Body Fat"])


@router.post("/estimate")
async def estimate_bodyfat(data: BodyFatManual, current_user=Depends(get_current_user)):
    try:
        bf = get_best_estimate(
            gender=data.gender,
            height_cm=data.height_cm,
            weight_kg=data.weight_kg,
            age=data.age,
            waist_cm=data.waist_cm,
            neck_cm=data.neck_cm,
            hip_cm=data.hip_cm
        )

        result = get_bodyfat_range(bf)
        result["category"] = get_bodyfat_category(bf, data.gender)

        doc = {
            "user_id": current_user.get("id") or str(current_user.get("_id", "")),
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

    except Exception as e:
        return error_response(f"Estimation failed: {str(e)}", 500)


@router.post("/photo")
async def estimate_from_photo(current_user=Depends(get_current_user)):
    return error_response("Photo estimation coming soon", 400)


@router.get("/history")
async def get_bodyfat_history(current_user=Depends(get_current_user)):
    try:
        cursor = bodyfat_col.find(
            {"user_id": current_user.get("id") or str(current_user.get("_id", ""))}
        ).sort("date", -1).limit(30)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        return success_response(history, "History retrieved")
    except Exception as e:
        return error_response(str(e), 500)