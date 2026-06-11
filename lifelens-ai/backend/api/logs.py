from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_db
from models.schemas import DailyLogCreate, DailyLogUpdate, ApiResponse
from utils.auth import get_current_user
from services.scoring import compute_scores

router = APIRouter(prefix="/logs", tags=["Logs"])

def sl(log):
    log["id"]=str(log.pop("_id","")); log["userId"]=str(log.get("userId","")); return log

@router.post("", response_model=ApiResponse)
async def create(p: DailyLogCreate, cu=Depends(get_current_user), db=Depends(get_db)):
    uid=str(cu["_id"])
    if await db.daily_logs.find_one({"userId":uid,"date":p.date}):
        raise HTTPException(409,"Log for this date already exists")
    scores=compute_scores(p)
    dur=p.sleepDuration
    if not dur:
        try:
            wh,wm=map(int,p.wakeTime.split(":")); sh,sm=map(int,p.sleepTime.split(":"))
            wm2,sm2=wh*60+wm,sh*60+sm
            if wm2<sm2: wm2+=24*60
            dur=round((wm2-sm2)/60,2)
        except: dur=None
    doc={**p.model_dump(),"userId":uid,"sleepDuration":dur,
        "scores":scores.model_dump(),"createdAt":datetime.utcnow(),"updatedAt":datetime.utcnow()}
    r=await db.daily_logs.insert_one(doc); doc["_id"]=r.inserted_id
    await _update_streak(uid,p.date,scores.overall,db)
    return ApiResponse(data=sl(doc),message="Daily log saved")

@router.get("/date/{date}", response_model=ApiResponse)
async def by_date(date: str, cu=Depends(get_current_user), db=Depends(get_db)):
    log=await db.daily_logs.find_one({"userId":str(cu["_id"]),"date":date})
    if not log: raise HTTPException(404,"No log for this date")
    return ApiResponse(data=sl(log))

@router.get("/recent", response_model=ApiResponse)
async def recent(days: int=Query(30,ge=1,le=365), cu=Depends(get_current_user), db=Depends(get_db)):
    since=(datetime.utcnow()-timedelta(days=days)).strftime("%Y-%m-%d")
    cursor=db.daily_logs.find({"userId":str(cu["_id"]),"date":{"$gte":since}}).sort("date",-1).limit(days)
    return ApiResponse(data=[sl(l) async for l in cursor])

@router.put("/{lid}", response_model=ApiResponse)
async def update(lid: str, p: DailyLogUpdate, cu=Depends(get_current_user), db=Depends(get_db)):
    try: oid=ObjectId(lid)
    except: raise HTTPException(400,"Invalid ID")
    existing=await db.daily_logs.find_one({"_id":oid,"userId":str(cu["_id"])})
    if not existing: raise HTTPException(404,"Log not found")
    upd={k:v for k,v in p.model_dump().items() if v is not None}
    upd["updatedAt"]=datetime.utcnow()
    await db.daily_logs.update_one({"_id":oid},{"$set":upd})
    return ApiResponse(data=sl(await db.daily_logs.find_one({"_id":oid})))

@router.get("/chart", response_model=ApiResponse)
async def chart(period: str=Query("weekly"), cu=Depends(get_current_user), db=Depends(get_db)):
    days={"daily":1,"weekly":7,"monthly":30}.get(period,14)
    since=(datetime.utcnow()-timedelta(days=days*2)).strftime("%Y-%m-%d")
    cursor=db.daily_logs.find({"userId":str(cu["_id"]),"date":{"$gte":since}}).sort("date",1).limit(60)
    data=[]
    async for l in cursor:
        try: label=datetime.strptime(l.get("date",""),"%Y-%m-%d").strftime("%b %d")
        except: label=l.get("date","")
        sc=l.get("scores",{})
        data.append({"date":l.get("date"),"label":label,"mood":sc.get("mood",0),"health":sc.get("health",0),
            "productivity":sc.get("productivity",0),"sleep":sc.get("sleep",0),"diet":sc.get("diet",0)})
    return ApiResponse(data=data)

async def _update_streak(uid,date,overall,db):
    try:
        oid=ObjectId(uid); u=await db.users.find_one({"_id":oid})
        if not u: return
        yd=(datetime.strptime(date,"%Y-%m-%d")-timedelta(days=1)).strftime("%Y-%m-%d")
        streak=(u.get("streak",0)+1) if await db.daily_logs.find_one({"userId":uid,"date":yd}) else 1
        pts=10+(15 if overall>=80 else 8 if overall>=65 else 4 if overall>=50 else 0)
        if streak%7==0: pts+=25
        await db.users.update_one({"_id":oid},{"$set":{"streak":streak},"$inc":{"points":pts}})
    except Exception as e:
        import logging; logging.getLogger(__name__).warning(f"Streak update: {e}")
