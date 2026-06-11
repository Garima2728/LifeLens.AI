from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from database import get_db
from models.schemas import LoginRequest, RegisterRequest, ApiResponse
from utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user, serialize_user, decode_token
from config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=ApiResponse)
async def register(p: RegisterRequest, db=Depends(get_db)):
    if await db.users.find_one({"email":p.email.lower()}):
        raise HTTPException(409, "Email already registered")
    doc={"name":p.name.strip(),"email":p.email.lower(),"passwordHash":hash_password(p.password),
        "age":p.age,"goals":[],"lifestyle":{"activityLevel":"moderate","dietType":"omnivore",
        "sleepGoal":8.0,"workHoursGoal":8.0,"exerciseGoal":30},
        "streak":0,"points":0,"badges":[],"createdAt":datetime.utcnow(),"updatedAt":datetime.utcnow()}
    r=await db.users.insert_one(doc); doc["_id"]=r.inserted_id; uid=str(r.inserted_id)
    return ApiResponse(data={"user":serialize_user(doc),"tokens":{
        "accessToken":create_access_token(uid,p.email.lower()),
        "refreshToken":create_refresh_token(uid),
        "expiresIn":settings.ACCESS_TOKEN_EXPIRE_MINUTES*60}},message="Account created")

@router.post("/login", response_model=ApiResponse)
async def login(p: LoginRequest, db=Depends(get_db)):
    u=await db.users.find_one({"email":p.email.lower()})
    if not u or not verify_password(p.password,u["passwordHash"]):
        raise HTTPException(401,"Invalid email or password")
    uid=str(u["_id"])
    await db.users.update_one({"_id":u["_id"]},{"$set":{"lastLoginAt":datetime.utcnow()}})
    return ApiResponse(data={"user":serialize_user(u),"tokens":{
        "accessToken":create_access_token(uid,u["email"]),
        "refreshToken":create_refresh_token(uid),
        "expiresIn":settings.ACCESS_TOKEN_EXPIRE_MINUTES*60}})

@router.get("/me", response_model=ApiResponse)
async def me(cu=Depends(get_current_user)): return ApiResponse(data=serialize_user(cu))

@router.post("/logout")
async def logout(cu=Depends(get_current_user)): return ApiResponse(message="Logged out")
