import os
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    env: str = os.getenv("ENV", "development")
    port: int = int(os.getenv("PORT", 8000))
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "shared_internal_secret_change_me")
    backend_origin: str = os.getenv("BACKEND_ORIGIN", "http://localhost:5000")
    model_dir: Path = BASE_DIR / os.getenv("MODEL_DIR", "trained_models")
    data_dir: Path = BASE_DIR / os.getenv("DATA_DIR", "data")

    class Config:
        env_file = ".env"


settings = Settings()
settings.model_dir.mkdir(parents=True, exist_ok=True)
settings.data_dir.mkdir(parents=True, exist_ok=True)
