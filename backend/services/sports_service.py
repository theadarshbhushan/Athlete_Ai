from datetime import datetime, timezone

from bson import ObjectId

from database.db import sports_col


def _serialize_session(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


async def create_sports_session(user_id: str, session_data: dict) -> dict:
    doc = {
        **session_data,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await sports_col.insert_one(doc)
    session = await sports_col.find_one({"_id": result.inserted_id})
    return _serialize_session(session)


async def get_sports_sessions(user_id: str) -> list[dict]:
    cursor = sports_col.find({"user_id": user_id}).sort("date", -1)
    return [_serialize_session(s) async for s in cursor]


async def get_sports_performance(user_id: str) -> list[dict]:
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": "$sport",
                "total_sessions": {"$sum": 1},
                "total_duration": {"$sum": "$duration_min"},
                "avg_intensity": {"$avg": "$intensity"},
                "wins": {
                    "$sum": {"$cond": [{"$eq": ["$result", "win"]}, 1, 0]}
                },
                "losses": {
                    "$sum": {"$cond": [{"$eq": ["$result", "loss"]}, 1, 0]}
                },
            }
        },
        {"$sort": {"total_sessions": -1}},
    ]
    results = await sports_col.aggregate(pipeline).to_list(None)
    return [
        {
            "sport": r["_id"],
            "total_sessions": r["total_sessions"],
            "total_duration": r["total_duration"],
            "avg_intensity": round(r["avg_intensity"], 1),
            "wins": r["wins"],
            "losses": r["losses"],
        }
        for r in results
    ]
