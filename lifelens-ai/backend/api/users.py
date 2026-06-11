from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_db
from models.schemas import UserUpdate, HabitCreate, HabitComplete, ApiResponse
from utils.auth import get_current_user, serialize_user

router = APIRouter()

# ─ Users ─────────────────────────────────────────────────────
@router.get("/users/me", response_model=ApiResponse)
async def me(cu=Depends(get_current_user)): return ApiResponse(data=serialize_user(cu))

@router.put("/users/me", response_model=ApiResponse)
async def update_me(p: UserUpdate, cu=Depends(get_current_user), db=Depends(get_db)):
    upd={k:v for k,v in p.model_dump().items() if v is not None}
    if "lifestyle" in upd and hasattr(upd["lifestyle"],"model_dump"): upd["lifestyle"]=upd["lifestyle"].model_dump()
    upd["updatedAt"]=datetime.utcnow()
    await db.users.update_one({"_id":cu["_id"]},{"$set":upd})
    return ApiResponse(data=serialize_user(await db.users.find_one({"_id":cu["_id"]})))

@router.put("/users/me/goals", response_model=ApiResponse)
async def goals(p: dict, cu=Depends(get_current_user), db=Depends(get_db)):
    await db.users.update_one({"_id":cu["_id"]},{"$set":{"goals":p.get("goals",[])[:10],"updatedAt":datetime.utcnow()}})
    return ApiResponse(message="Goals updated")

@router.get("/users/stats", response_model=ApiResponse)
async def stats(cu=Depends(get_current_user), db=Depends(get_db)):
    uid=str(cu["_id"])
    return ApiResponse(data={"streak":cu.get("streak",0),"points":cu.get("points",0),
        "totalLogs":await db.daily_logs.count_documents({"userId":uid}),
        "totalInsights":await db.ai_insights.count_documents({"userId":uid}),"badges":cu.get("badges",[])})

# ─ Habits ────────────────────────────────────────────────────
def sh(h): h["id"]=str(h.pop("_id","")); h["userId"]=str(h.get("userId","")); return h

@router.get("/habits", response_model=ApiResponse)
async def list_habits(cu=Depends(get_current_user), db=Depends(get_db)):
    cur=db.habits.find({"userId":str(cu["_id"])}).sort("createdAt",-1)
    return ApiResponse(data=[sh(h) async for h in cur])

@router.post("/habits", response_model=ApiResponse)
async def create_habit(p: HabitCreate, cu=Depends(get_current_user), db=Depends(get_db)):
    uid=str(cu["_id"])
    if await db.habits.count_documents({"userId":uid})>=20: raise HTTPException(400,"Max 20 habits")
    doc={"userId":uid,"name":p.name,"category":p.category,"targetDays":p.targetDays,
        "color":p.color,"icon":p.icon,"currentStreak":0,"longestStreak":0,
        "completedDates":[],"createdAt":datetime.utcnow()}
    r=await db.habits.insert_one(doc); doc["_id"]=r.inserted_id
    return ApiResponse(data=sh(doc),message="Habit created")

@router.post("/habits/{hid}/complete", response_model=ApiResponse)
async def complete(hid: str, p: HabitComplete, cu=Depends(get_current_user), db=Depends(get_db)):
    try: oid=ObjectId(hid)
    except: raise HTTPException(400,"Invalid ID")
    h=await db.habits.find_one({"_id":oid,"userId":str(cu["_id"])})
    if not h: raise HTTPException(404,"Habit not found")
    dates=h.get("completedDates",[])
    if p.date in dates: raise HTTPException(409,"Already completed today")
    dates=sorted(set(dates+[p.date]))[-90:]
    streak=0; check=datetime.utcnow()
    for _ in range(90):
        if check.strftime("%Y-%m-%d") in dates: streak+=1; check-=timedelta(days=1)
        else: break
    longest=max(h.get("longestStreak",0),streak)
    await db.habits.update_one({"_id":oid},{"$set":{"completedDates":dates,"currentStreak":streak,"longestStreak":longest}})
    await db.users.update_one({"_id":cu["_id"]},{"$inc":{"points":5}})
    return ApiResponse(data=sh(await db.habits.find_one({"_id":oid})),message="Habit completed +5pts")

@router.delete("/habits/{hid}")
async def del_habit(hid: str, cu=Depends(get_current_user), db=Depends(get_db)):
    try: oid=ObjectId(hid)
    except: raise HTTPException(400,"Invalid ID")
    r=await db.habits.delete_one({"_id":oid,"userId":str(cu["_id"])})
    if not r.deleted_count: raise HTTPException(404,"Not found")
    return ApiResponse(message="Deleted")
