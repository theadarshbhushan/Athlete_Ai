from motor.motor_asyncio import AsyncIOMotorClient

from config.settings import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
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
