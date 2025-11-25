"""Application configuration management"""

from typing import List

from pydantic import validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    PROJECT_NAME: str = "Coach AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str
    DATABASE_URL_ASYNC: str

    # Azure Speech Services
    AZURE_SPEECH_KEY: str
    AZURE_SPEECH_REGION: str = "uksouth"

    # Azure OpenAI
    AZURE_OPENAI_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_DEPLOYMENT_NAME: str = "gpt-4"
    AZURE_OPENAI_API_VERSION: str = "2024-02-15-preview"

    # Azure AD B2C
    AZURE_AD_TENANT_ID: str = ""
    AZURE_AD_CLIENT_ID: str = ""
    AZURE_AD_CLIENT_SECRET: str = ""

    # External APIs
    CLARE_API_URL: str = (
        "https://clare-guidelines-app-bqd0cggnf4a6gnfd.uksouth-01.azurewebsites.net"
    )
    CLARE_API_KEY: str = ""
    CLARK_API_URL: str = "https://clark-medical-app-hwawcvckdrfngnbg.uksouth-01.azurewebsites.net"
    CLARK_API_KEY: str = ""

    # ElevenLabs (fallback)
    ELEVENLABS_API_KEY: str = ""

    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            # Handle JSON array string
            if v.startswith("["):
                import json

                return json.loads(v)
            # Handle comma-separated string
            return [i.strip() for i in v.split(",")]
        return v

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")


# Create global settings instance
settings = Settings()
