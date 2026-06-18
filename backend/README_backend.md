# Athlete AI — Backend Setup

## Prerequisites

- Python 3.10+
- MongoDB Atlas account ([https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd AtheleteAi/backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `MONGODB_URL` | MongoDB Atlas connection string |
   | `SECRET_KEY` | JWT signing secret (use a long random string) |
   | `ALGORITHM` | JWT algorithm (default: `HS256`) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry in minutes (default: 10080 = 7 days) |

5. **MongoDB Atlas setup**

   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user with read/write access
   - Whitelist your IP address (or `0.0.0.0/0` for development)
   - Copy the connection string and set `MONGODB_URL` in `.env`
   - The app uses the `athleteai` database automatically

6. **Run the server**

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`.

   - Health check: `GET http://localhost:8000/`
   - Interactive docs: `http://localhost:8000/docs`

## Frontend

The frontend runs on `http://localhost:5173`. CORS is configured to allow all origins in development.

## ML Models

Place trained model files in `ml/models/`:

- `fatigue_model.pkl`
- `injury_model.pkl`
- `bodyfat_model.pkl`

If model files are missing, the API uses rule-based fallback logic and will not crash.

## API Overview

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Registration, login, JWT auth |
| `/api/user` | Profile management |
| `/api/workouts` | Workout logging and summaries |
| `/api/sports` | Sports session tracking |
| `/api/health` | Smartwatch / health metrics |
| `/api/predict` | Fatigue, recovery, injury, recommendations |
| `/api/bodyfat` | Body fat estimation |
| `/api/analytics` | Training analytics and dashboard |

## Uploads

Body photos are saved to `uploads/body_photos/` (gitignored). This directory is created automatically on first upload.
