import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URL: str = ""
    MONGO_URI: str = ""
    MONGODB_URI: str = ""
    SECRET_KEY: str = ""
    JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def model_post_init(self, __context):
        # Resolve MongoDB connection URI from all common environment variable names
        resolved_mongo = (
            self.MONGODB_URL
            or self.MONGODB_URI
            or self.MONGO_URI
            or os.getenv("MONGODB_URI", "")
            or os.getenv("MONGO_URI", "")
            or os.getenv("MONGODB_URL", "")
            or "mongodb://localhost:27017"
        )
        object.__setattr__(self, "MONGODB_URL", resolved_mongo)

        # Resolve JWT secret from SECRET_KEY or JWT_SECRET
        resolved_secret = (
            self.SECRET_KEY
            or self.JWT_SECRET
            or os.getenv("SECRET_KEY", "")
            or os.getenv("JWT_SECRET", "")
            or "athlete-ai-default-dev-secret-key-32chars"
        )
        object.__setattr__(self, "SECRET_KEY", resolved_secret)


settings = Settings()
