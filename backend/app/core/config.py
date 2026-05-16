from pydantic_settings import BaseSettings
from typing import List
import os
import json
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Vivitalk"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Vivitalk - 3D 비주얼 AI 챗봇 빌더 플랫폼"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    PUBLIC_BACKEND_URL: str = os.getenv("PUBLIC_BACKEND_URL", "http://localhost:8000")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "vivitalk-index")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_API_KEY: str = os.getenv("SUPABASE_API_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "*",
    ]

    RATE_LIMIT_PER_MINUTE: int = 120

    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "text")

    RAG_SIMILARITY_THRESHOLD: float = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.6"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))
    RAG_HYBRID_ALPHA: float = float(os.getenv("RAG_HYBRID_ALPHA", "0.6"))

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()

_cors_env = os.getenv("CORS_ORIGINS")
if _cors_env:
    try:
        if _cors_env.strip().startswith("["):
            settings.CORS_ORIGINS = json.loads(_cors_env)
        else:
            settings.CORS_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]
    except Exception:
        pass
