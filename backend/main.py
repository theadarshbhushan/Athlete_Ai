import logging
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

logger = logging.getLogger("athlete_ai")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await check_connection()
        logger.info("MongoDB connected successfully")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
    yield


app = FastAPI(
    title="Athlete AI",
    description="AI-powered fitness coach backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Origins allowed to make requests with credentials (cookies / auth headers)
origins = [
    "https://athlete-ai-eta.vercel.app",  # Production frontend on Vercel
    "http://localhost:3000",              # Local React/Next.js dev server
    "http://localhost:5173",              # Local Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception processing {request.method} {request.url.path}: {exc}\n"
        f"{traceback.format_exc()}"
    )
    origin = request.headers.get("origin")
    headers = {
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    else:
        headers["Access-Control-Allow-Origin"] = "*"

    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=headers,
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