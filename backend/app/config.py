"""
Configuration settings for PathFinder AI Backend
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Get root directory
ROOT_DIR = Path(__file__).parent.parent.parent


class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    APP_NAME: str = "PathFinder AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pathfinder_ai"
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI/ML Settings
    # Google Vertex AI
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_PROJECT_ID: Optional[str] = None
    GEMINI_MODEL_NAME: str = "gemini-1.0-pro-001"
    EMBEDDING_MODEL_NAME: str = "textembedding-gecko@003"
    
    # Groq API
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # OpenAI (fallback)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    # Embedding Settings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"  # Sentence transformers
    
    # ChromaDB
    CHROMA_DB_PATH: str = str(ROOT_DIR / "chroma_db")
    VECTOR_DB_COLLECTION: str = "job_database"
    
    # File Upload
    UPLOAD_DIR: Path = ROOT_DIR / "uploads"
    MAX_UPLOAD_SIZE: int = 15 * 1024 * 1024  # 15MB
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".txt"]
    
    # RAG Settings
    RAG_SEARCH_RESULTS_LIMIT: int = 15
    RAG_BATCH_SIZE: int = 100
    
    # LLM Settings
    MAX_TOKENS_DEFAULT: int = 500
    TEMPERATURE_DEFAULT: float = 0.7
    
    # Job Search
    JOBS_CSV_PATH: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Create upload directory if it doesn't exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
