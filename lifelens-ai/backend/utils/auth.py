from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

def hash_password(p: str) -> str:     return pwd_context.hash(p)
def verify_password(p: str, h: str) -> bool: return pwd_context.verify(p, h)

def create_access_token(user_id: str, email: str) -> str:
    return jwt.encode({"sub":user_id,"email":email,"type":"access",
        "exp":datetime.utcnow()+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat":datetime.utcnow()}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    return jwt.encode({"sub":user_id,"type":"refresh",
        "exp":datetime.utcnow()+timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "iat":datetime.utcnow()}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try: return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token",
            headers={"WWW-Authenticate":"Bearer"}) from e

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db=Depends(get_db),
) -> dict:
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    from bson import ObjectId
    try:
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["id"] = str(user["_id"])
    return user

def serialize_user(u: dict) -> dict:
    return { "id":str(u.get("_id",u.get("id",""))), "name":u.get("name"),
        "email":u.get("email"), "age":u.get("age"), "goals":u.get("goals",[]),
        "lifestyle":u.get("lifestyle",{}), "streak":u.get("streak",0),
        "points":u.get("points",0), "badges":u.get("badges",[]),
        "createdAt":str(u.get("createdAt","")) }
