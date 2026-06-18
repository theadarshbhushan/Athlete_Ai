from datetime import datetime, timedelta, timezone

from database.db import bodyfat_col, health_col, predictions_col, workouts_col
from ml.prediction.fatigue_predictor import predict_fatigue
from ml.prediction.recovery_predictor import calculate_recovery_score, get_recovery_advice
from services.recommendation_service import get_workout_recommendation
from services.training_load_service import get_weekly_load


FATIGUE_NUMERIC = {"Fresh": 1, "Normal": 3, "Fatigued": 7, "Overtrained": 10}


def _date_n_days_ago(n: int) -> str:
    return (datetime.now(timezone.utc).date() - timedelta(days=n)).isoformat()


def _week_start(date) -> str:
    return (date - timedelta(days=date.weekday())).isoformat()


async def get_training_load_weekly(user_id: str, weeks: int = 8) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    results = []

    for i in range(weeks - 1, -1, -1):
        week_end = today - timedelta(weeks=i)
        week_start_date = week_end - timedelta(days=week_end.weekday())
        week_end_date = week_start_date + timedelta(days=6)
        start_str = week_start_date.isoformat()
        end_str = week_end_date.isoformat()

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "date": {"$gte": start_str, "$lte": end_str},
                }
            },
            {"$group": {"_id": None, "total_load": {"$sum": "$training_load"}}},
        ]
        agg = await workouts_col.aggregate(pipeline).to_list(1)
        total_load = round(agg[0]["total_load"], 2) if agg else 0
        results.append({"week_start": start_str, "training_load": total_load})

    return results


async def get_recovery_trend(user_id: str, days: int = 30) -> list[dict]:
    start_date = _date_n_days_ago(days - 1)
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
        {"$project": {"date": 1, "recovery_score": 1, "_id": 0}},
        {"$sort": {"date": 1}},
    ]
    return await predictions_col.aggregate(pipeline).to_list(None)


async def get_strength_progress(user_id: str) -> list[dict]:
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "weight_kg": {"$exists": True, "$ne": None},
            }
        },
        {
            "$group": {
                "_id": {"exercise": "$exercise", "date": "$date"},
                "max_weight": {"$max": "$weight_kg"},
            }
        },
        {"$sort": {"_id.date": 1}},
        {
            "$group": {
                "_id": "$_id.exercise",
                "history": {
                    "$push": {"date": "$_id.date", "max_weight": "$max_weight"}
                },
            }
        },
    ]
    results = await workouts_col.aggregate(pipeline).to_list(None)
    return [
        {"exercise": r["_id"], "history": r["history"]}
        for r in results
    ]


async def get_workout_consistency(user_id: str, weeks: int = 8) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    results = []

    for i in range(weeks - 1, -1, -1):
        week_end = today - timedelta(weeks=i)
        week_start_date = week_end - timedelta(days=week_end.weekday())
        week_end_date = week_start_date + timedelta(days=6)
        start_str = week_start_date.isoformat()
        end_str = week_end_date.isoformat()

        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "date": {"$gte": start_str, "$lte": end_str},
                    "type": {"$ne": "rest"},
                }
            },
            {"$group": {"_id": "$date"}},
            {"$count": "days_trained"},
        ]
        agg = await workouts_col.aggregate(pipeline).to_list(1)
        days = agg[0]["days_trained"] if agg else 0
        results.append({"week_start": start_str, "days_trained": days})

    return results


async def get_sleep_trend_analytics(user_id: str, days: int = 30) -> list[dict]:
    start_date = _date_n_days_ago(days - 1)
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
        {"$project": {"date": 1, "sleep_hours": 1, "_id": 0}},
        {"$sort": {"date": 1}},
    ]
    return await health_col.aggregate(pipeline).to_list(None)


async def get_calories_trend(user_id: str, days: int = 30) -> list[dict]:
    start_date = _date_n_days_ago(days - 1)
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
        {
            "$project": {
                "date": 1,
                "calories": {
                    "$ifNull": [
                        "$calories_burned",
                        {"$ifNull": ["$workout_calories", 0]},
                    ]
                },
                "_id": 0,
            }
        },
        {"$sort": {"date": 1}},
    ]

    # Aggregate workout calories per day as fallback
    workout_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "date": {"$gte": start_date},
                "calories_burned": {"$exists": True, "$ne": None},
            }
        },
        {
            "$group": {
                "_id": "$date",
                "workout_calories": {"$sum": "$calories_burned"},
            }
        },
    ]
    workout_cals = {
        r["_id"]: r["workout_calories"]
        async for r in workouts_col.aggregate(workout_pipeline)
    }

    health_records = await health_col.aggregate(
        [
            {"$match": {"user_id": user_id, "date": {"$gte": start_date}}},
            {"$project": {"date": 1, "calories_burned": 1, "_id": 0}},
            {"$sort": {"date": 1}},
        ]
    ).to_list(None)

    seen_dates = set()
    results = []
    for record in health_records:
        date = record["date"]
        seen_dates.add(date)
        cal = record.get("calories_burned") or workout_cals.get(date, 0)
        results.append({"date": date, "calories": cal})

    for date, cal in sorted(workout_cals.items()):
        if date not in seen_dates:
            results.append({"date": date, "calories": cal})

    results.sort(key=lambda x: x["date"])
    return results


async def get_bodyfat_progress(user_id: str) -> list[dict]:
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$project": {
                "date": 1,
                "estimate": 1,
                "range_low": 1,
                "range_high": 1,
                "_id": 0,
            }
        },
        {"$sort": {"date": 1}},
    ]
    return await bodyfat_col.aggregate(pipeline).to_list(None)


async def get_performance_score(user_id: str, days: int = 30) -> list[dict]:
    start_date = _date_n_days_ago(days - 1)

    predictions = await predictions_col.find(
        {"user_id": user_id, "date": {"$gte": start_date}}
    ).to_list(None)

    health_records = {
        h["date"]: h
        async for h in health_col.find(
            {"user_id": user_id, "date": {"$gte": start_date}}
        )
    }

    results = []
    for pred in predictions:
        date = pred["date"]
        recovery = pred.get("recovery_score", 50)
        fatigue = pred.get("fatigue_status", "Normal")
        fatigue_num = FATIGUE_NUMERIC.get(fatigue, 5)
        sleep = health_records.get(date, {}).get("sleep_hours", 7)

        score = recovery * 0.4 + (10 - fatigue_num) * 30 + sleep * 5
        score = round(min(max(score, 0), 100), 1)

        results.append({"date": date, "performance_score": score})

    results.sort(key=lambda x: x["date"])
    return results


async def get_dashboard_summary(user_id: str, user: dict) -> dict:
    today = datetime.now(timezone.utc).date().isoformat()

    prediction = await predictions_col.find_one({"user_id": user_id, "date": today})
    health = await health_col.find_one({"user_id": user_id, "date": today})

    today_start = datetime.now(timezone.utc).date()
    week_start = (today_start - timedelta(days=today_start.weekday())).isoformat()
    week_workouts = await workouts_col.find(
        {"user_id": user_id, "date": {"$gte": week_start}}
    ).to_list(None)
    weekly_load = get_weekly_load(week_workouts)

    if prediction:
        return {
            "date": today,
            "recovery_score": prediction.get("recovery_score"),
            "fatigue_status": prediction.get("fatigue_status"),
            "injury_risk": prediction.get("injury_risk"),
            "training_load": weekly_load,
            "steps": health.get("steps") if health else None,
            "sleep_hours": health.get("sleep_hours") if health else None,
            "recommendation": prediction.get("recommendation"),
            "recommendation_reason": prediction.get("recommendation_reason"),
        }

    # Compute on the fly if no prediction stored yet
    sleep_hours = health.get("sleep_hours", 7) if health else 7
    resting_hr = health.get("resting_hr", 70) if health else 70
    energy_level = health.get("energy_level", 5) if health else 5

    workout = await workouts_col.find_one(
        {"user_id": user_id, "date": today}, sort=[("created_at", -1)]
    )
    soreness = workout.get("soreness", 5) if workout else 5
    training_load = workout.get("training_load", 0) if workout else 0
    intensity = workout.get("intensity", 5) if workout else 5

    fatigue_result = predict_fatigue(
        sleep_hours, soreness, energy_level, training_load, resting_hr, intensity
    )
    recovery_score = calculate_recovery_score(
        sleep_hours, soreness, resting_hr, training_load, energy_level
    )
    from services.injury_risk_service import get_injury_prediction

    injury = get_injury_prediction(training_load, training_load * 0.8, sleep_hours, soreness)
    rec, reason = get_workout_recommendation(
        fatigue_result["fatigue_status"],
        recovery_score,
        injury["injury_risk"],
        user.get("sport", "gym"),
        user.get("goal", "performance"),
    )

    return {
        "date": today,
        "recovery_score": recovery_score,
        "fatigue_status": fatigue_result["fatigue_status"],
        "injury_risk": injury["injury_risk"],
        "training_load": weekly_load,
        "steps": health.get("steps") if health else None,
        "sleep_hours": sleep_hours,
        "recommendation": rec,
        "recommendation_reason": reason,
    }
