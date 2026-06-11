from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "LifeLens AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION_32_CHARS_MIN"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "lifelens"
    REDIS_URL: str = "redis://localhost:6379"

    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o"

    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@lifelens.ai"

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000","https://lifelens.ai"]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
