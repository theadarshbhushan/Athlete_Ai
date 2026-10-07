import os
from motor.motor_asyncio import AsyncIOMotorClient

from config.settings import settings

mongo_uri = (
    os.getenv("MONGO_URI")
    or os.getenv("MONGODB_URI")
    or os.getenv("MONGODB_URL")
    or settings.MONGODB_URL
)

# Set serverSelectionTimeoutMS to 5000ms (5 seconds) so database connectivity issues fail fast
client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client["athleteai"]

users_col = db["users"]
workouts_col = db["workouts"]
health_col = db["health"]
predictions_col = db["predictions"]
bodyfat_col = db["bodyfat"]
sports_col = db["sports"]


async def check_connection() -> bool:
    """Ping MongoDB to verify connectivity."""
    await client.admin.command("ping")
    return True
