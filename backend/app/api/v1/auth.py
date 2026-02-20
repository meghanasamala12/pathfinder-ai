"""
Authentication API: signup and login using PostgreSQL
"""
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database.base import get_db
from app.database.models.pathfinder import PathfinderUser

router = APIRouter()


def _create_access_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    name: str


@router.post("/auth/signup", response_model=AuthResponse)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user account stored in PostgreSQL."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    email_lower = req.email.lower().strip()
    name = (req.name or "").strip() or email_lower.split("@")[0]

    # Check if email already exists
    r = await db.execute(select(PathfinderUser).where(PathfinderUser.email == email_lower))
    existing = r.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and save to DB
    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    user = PathfinderUser(email=email_lower, name=name, password_hash=hashed)
    db.add(user)
    await db.commit()

    token = _create_access_token(email_lower)
    return AuthResponse(access_token=token, email=email_lower, name=name)


@router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login using PostgreSQL user records."""
    email_lower = req.email.lower().strip()

    r = await db.execute(select(PathfinderUser).where(PathfinderUser.email == email_lower))
    user = r.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(req.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_access_token(email_lower)
    return AuthResponse(
        access_token=token,
        email=email_lower,
        name=user.name or email_lower.split("@")[0],
    )
