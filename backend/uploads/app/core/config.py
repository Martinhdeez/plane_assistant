from os import getenv
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = ".env"
if getenv("ENV_FILE") != None:
    ENV_FILE = getenv("ENV_FILE")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Plane Assistant"
    VERSION: str = "1.0.0"
    
    # Gemini AI Configuration
    GOOGLE_API_KEY: str = "xxx"
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    
    # Photo uploads
    UPLOAD_PATH: str = "uploads/users"
    TEMPLATE_PATH: str = "uploads/templates"

    # Database
    DATABASE_URL: str = "postgres+asyncpg://username:password@hostname:port/database-name"
    
    # Jwt
    JWT_SECRET: str = "xxx"

    model_config = SettingsConfigDict(env_file=ENV_FILE, case_sensitive=True, extra="ignore")

settings = Settings()
