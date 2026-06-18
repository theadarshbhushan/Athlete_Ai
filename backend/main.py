from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import check_connection
from routes import (
    analytics_routes,
    auth_routes,
    bodyfat_routes,
    prediction_routes,
    smartwatch_routes,
    sports_routes,
    user_routes,
    workout_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await check_connection()
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    yield


app = FastAPI(
    title="Athlete AI",
    description="AI-powered fitness coach backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

app.include_router(auth_routes.router, prefix=API_PREFIX)
app.include_router(user_routes.router, prefix=API_PREFIX)
app.include_router(workout_routes.router, prefix=API_PREFIX)
app.include_router(sports_routes.router, prefix=API_PREFIX)
app.include_router(smartwatch_routes.router, prefix=API_PREFIX)
app.include_router(prediction_routes.router, prefix=API_PREFIX)
app.include_router(bodyfat_routes.router, prefix=API_PREFIX)
app.include_router(analytics_routes.router, prefix=API_PREFIX)


@app.get("/")
async def health_check():
    return {"status": "Athlete AI backend running"}
