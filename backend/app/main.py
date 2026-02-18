"""
FastAPI application entry point
"""
# Suppress pypdf/cryptography deprecation warning (ARC4) - harmless until cryptography 48.x
import warnings
warnings.filterwarnings("ignore", message=".*ARC4.*", category=DeprecationWarning, module=".*cryptography.*")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1 import resume, career, auth

# Optional: alumni and students need DB (greenlet + asyncpg). Include only if DB is available.
_alumni = _students = None
try:
    from app.api.v1 import alumni, students
    _alumni, _students = alumni, students
except Exception:
    pass

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered career navigation platform"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (career + resume work without a database)
app.include_router(resume.router, prefix=settings.API_V1_PREFIX, tags=["resume"])
app.include_router(career.router, prefix=settings.API_V1_PREFIX, tags=["career"])
app.include_router(auth.router, prefix=settings.API_V1_PREFIX, tags=["auth"])
if _alumni is not None:
    app.include_router(_alumni.router, prefix=settings.API_V1_PREFIX, tags=["alumni"])
if _students is not None:
    app.include_router(_students.router, prefix=settings.API_V1_PREFIX, tags=["students"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PathFinder AI API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
