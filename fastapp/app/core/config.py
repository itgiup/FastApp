from typing import List
from pathlib import Path

from pydantic import EmailStr, MongoDsn
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from app import __version__
from app.core.enums import LogLevel

# Simple environment loading - just load .env if exists
def load_env_file():
    """Simple .env file loading"""
    root_dir = Path("./")
    env_file = root_dir / ".env"

    if env_file.exists():
        load_dotenv(env_file)
        print(f"✅ Loaded .env from {env_file}")
    else:
        print("ℹ️ No .env file found, using environment variables")

# Load environment on import
load_env_file()

# This adds support for 'mongodb+srv' connection schemas when using e.g. MongoDB Atlas
# MongoDsn.allowed_schemes.add("mongodb+srv")


class Settings(BaseSettings):
    # compose stack
    SERVER_NAME: str = "s1"

    # Application
    PROJECT_NAME: str = "TickWA"
    PROJECT_VERSION: str = __version__
    API_V1_STR: str = "v1"
    DEBUG: bool = False  # Production mode by default
    # CORS_ORIGINS is a JSON-formatted list of origins
    CORS_ORIGINS: List[str] = ["*"]
    USE_CORRELATION_ID: bool = False  # Disable for performance

    UVICORN_HOST: str = "0.0.0.0"  # Default host
    UVICORN_PORT: int = 8080  # Default port

    # Logging
    LOG_LEVEL: str = LogLevel.INFO
    LOG_JSON_FORMAT: bool = False  # Use colored logs by default

    # MongoDB
    MONGODB_URI: MongoDsn = "mongodb://mongo:27017/"  # type: ignore[assignment]
    MONGODB_DB_NAME: str = "fastapp"

    # Superuser
    FIRST_SUPERUSER: str = "admin"
    FIRST_SUPERUSER_EMAIL: EmailStr = "admin@example.com"  # type: ignore[assignment]
    FIRST_SUPERUSER_PASSWORD: str = "admin123"

    # Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    SECRET_KEY: str = "9717de7dcef3d841a19e16993f269cff"

    # URLs
    URL_IDENT_LENGTH: int = 7

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # QDRANT
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333

    # postgres
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "fastapp"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = False  # Disable for performance

    class Config:
        # Place your .env file under this path
        env_file = ".env"
        env_prefix = "FASTAPP_"
        case_sensitive = True


# Missing named arguments are filled with environment variables
settings = Settings()  # type: ignore[call-arg]

