from datetime import datetime, timedelta, timezone
from typing import Optional

from database.db import health_col


def _serialize_health(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


async def log_health_metrics(user_id: str, metrics: dict) -> dict:
    doc = {
        **metrics,
        "user_id": user_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await health_col.update_one(
        {"user_id": user_id, "date": metrics["date"]},
        {"$set": doc},
        upsert=True,
    )
    record = await health_col.find_one({"user_id": user_id, "date": metrics["date"]})
    return _serialize_health(record)


async def get_today_metrics(user_id: str) -> Optional[dict]:
    today = datetime.now(timezone.utc).date().isoformat()
    record = await health_col.find_one({"user_id": user_id, "date": today})
    if not record:
        return None
    return _serialize_health(record)


async def get_metrics_history(user_id: str, days: int = 30) -> list[dict]:
    start_date = (datetime.now(timezone.utc).date() - timedelta(days=days - 1)).isoformat()
    cursor = health_col.find(
        {"user_id": user_id, "date": {"$gte": start_date}}
    ).sort("date", 1)
    return [_serialize_health(r) async for r in cursor]


async def get_sleep_trend(user_id: str, days: int = 30) -> list[dict]:
    start_date = (datetime.now(timezone.utc).date() - timedelta(days=days - 1)).isoformat()
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
        {"$project": {"date": 1, "sleep_hours": 1, "_id": 0}},
        {"$sort": {"date": 1}},
    ]
    return await health_col.aggregate(pipeline).to_list(None)


async def get_heart_rate_trend(user_id: str, days: int = 30) -> list[dict]:
    start_date = (datetime.now(timezone.utc).date() - timedelta(days=days - 1)).isoformat()
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
        {"$project": {"date": 1, "resting_hr": 1, "_id": 0}},
        {"$sort": {"date": 1}},
    ]
    return await health_col.aggregate(pipeline).to_list(None)


async def get_health_for_date(user_id: str, date: str) -> Optional[dict]:
    return await health_col.find_one({"user_id": user_id, "date": date})
