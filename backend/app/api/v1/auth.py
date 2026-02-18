"""
Authentication API: signup and login
"""
import json
import bcrypt
from pathlib import Path
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from jose import jwt

from app.config import settings

router = APIRouter()

USERS_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "users.json"


def _ensure_users_file() -> None:
    USERS_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not USERS_PATH.exists():
        USERS_PATH.write_text("[]", encoding="utf-8")


def _load_users() -> list:
    _ensure_users_file()
    data = USERS_PATH.read_text(encoding="utf-8")
    return json.loads(data)


def _save_users(users: list) -> None:
    _ensure_users_file()
    USERS_PATH.write_text(json.dumps(users, indent=2), encoding="utf-8")


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
async def signup(req: SignupRequest):
    """Create a new user account."""
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    users = _load_users()
    email_lower = req.email.lower().strip()
    if any(u.get("email", "").lower() == email_lower for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "email": email_lower,
        "password_hash": hashed,
        "name": (req.name or "").strip() or email_lower.split("@")[0],
    }
    users.append(user)
    _save_users(users)
    token = _create_access_token(email_lower)
    return AuthResponse(
        access_token=token,
        email=email_lower,
        name=user["name"],
    )


@router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Login and get access token."""
    users = _load_users()
    email_lower = req.email.lower().strip()
    user = next((u for u in users if u.get("email", "").lower() == email_lower), None)
    if not user or not bcrypt.checkpw(req.password.encode(), user.get("password_hash", "").encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = _create_access_token(email_lower)
    return AuthResponse(
        access_token=token,
        email=email_lower,
        name=user.get("name", email_lower.split("@")[0]),
    )
