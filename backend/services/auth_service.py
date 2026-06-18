from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from database.db import users_col
from utils.password_hashing import hash_password, verify_password
from utils.response_handler import error_response


def _serialize_user(user: dict) -> dict:
    user = dict(user)
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password", None)
    return user


async def register_user(user_data: dict) -> dict:
    existing = await users_col.find_one({"email": user_data["email"]})
    if existing:
        error_response("Email already registered", 409)

    insert_doc = {
        **user_data,
        "password": hash_password(user_data["password"]),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    result = await users_col.insert_one(insert_doc)
    user = await users_col.find_one({"_id": result.inserted_id})
    return _serialize_user(user)


async def login_user(email: str, password: str) -> Optional[dict]:
    user = await users_col.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        return None
    return _serialize_user(user)


async def get_user_by_id(user_id: str) -> Optional[dict]:
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return _serialize_user(user)


async def update_user_profile(user_id: str, updates: dict) -> dict:
    filtered = {k: v for k, v in updates.items() if v is not None}
    if not filtered:
        user = await users_col.find_one({"_id": ObjectId(user_id)})
        return _serialize_user(user)

    await users_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": filtered},
    )
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    return _serialize_user(user)


async def update_password(user_id: str, current: str, new_password: str) -> bool:
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    if not user or not verify_password(current, user["password"]):
        return False

    await users_col.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hash_password(new_password)}},
    )
    return True
