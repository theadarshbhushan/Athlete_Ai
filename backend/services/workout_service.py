from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId

from database.db import workouts_col
from services.training_load_service import calculate_training_load
from utils.response_handler import error_response


def _serialize_workout(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


async def create_workout(user_id: str, workout_data: dict) -> dict:
    training_load = calculate_training_load(
        workout_data["duration_min"], workout_data["intensity"]
    )
    doc = {
        **workout_data,
        "user_id": user_id,
        "training_load": training_load,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await workouts_col.insert_one(doc)
    workout = await workouts_col.find_one({"_id": result.inserted_id})
    return _serialize_workout(workout)


async def get_workouts(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> list[dict]:
    query: dict = {"user_id": user_id}
    if start_date or end_date:
        query["date"] = {}
        if start_date:
            query["date"]["$gte"] = start_date
        if end_date:
            query["date"]["$lte"] = end_date

    cursor = workouts_col.find(query).sort("date", -1)
    return [_serialize_workout(w) async for w in cursor]


async def get_workout_by_id(user_id: str, workout_id: str) -> dict:
    workout = await workouts_col.find_one(
        {"_id": ObjectId(workout_id), "user_id": user_id}
    )
    if not workout:
        error_response("Workout not found", 404)
    return _serialize_workout(workout)


async def update_workout(user_id: str, workout_id: str, updates: dict) -> dict:
    existing = await workouts_col.find_one(
        {"_id": ObjectId(workout_id), "user_id": user_id}
    )
    if not existing:
        error_response("Workout not found", 404)

    if "duration_min" in updates or "intensity" in updates:
        duration = updates.get("duration_min", existing["duration_min"])
        intensity = updates.get("intensity", existing["intensity"])
        updates["training_load"] = calculate_training_load(duration, intensity)

    await workouts_col.update_one(
        {"_id": ObjectId(workout_id)},
        {"$set": updates},
    )
    workout = await workouts_col.find_one({"_id": ObjectId(workout_id)})
    return _serialize_workout(workout)


async def delete_workout(user_id: str, workout_id: str) -> None:
    result = await workouts_col.delete_one(
        {"_id": ObjectId(workout_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        error_response("Workout not found", 404)


async def get_weekly_summary(user_id: str) -> dict:
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    week_start_str = week_start.isoformat()
    week_end_str = today.isoformat()

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "date": {"$gte": week_start_str, "$lte": week_end_str},
            }
        },
        {
            "$group": {
                "_id": None,
                "count": {"$sum": 1},
                "total_duration": {"$sum": "$duration_min"},
                "avg_intensity": {"$avg": "$intensity"},
                "total_training_load": {"$sum": "$training_load"},
            }
        },
    ]

    result = await workouts_col.aggregate(pipeline).to_list(1)
    if not result:
        return {
            "week_start": week_start_str,
            "week_end": week_end_str,
            "count": 0,
            "total_duration": 0,
            "avg_intensity": 0,
            "total_training_load": 0,
        }

    data = result[0]
    return {
        "week_start": week_start_str,
        "week_end": week_end_str,
        "count": data["count"],
        "total_duration": data["total_duration"],
        "avg_intensity": round(data["avg_intensity"], 1),
        "total_training_load": round(data["total_training_load"], 2),
    }


async def get_latest_workout(user_id: str, date: str) -> Optional[dict]:
    workout = await workouts_col.find_one(
        {"user_id": user_id, "date": date},
        sort=[("created_at", -1)],
    )
    return workout


async def get_workouts_in_range(user_id: str, start_date: str, end_date: str) -> list[dict]:
    cursor = workouts_col.find(
        {"user_id": user_id, "date": {"$gte": start_date, "$lte": end_date}}
    )
    return [w async for w in cursor]
