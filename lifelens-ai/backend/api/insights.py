from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from database import get_db
from models.schemas import GenerateInsightRequest, ApiResponse
from utils.auth import get_current_user
from services.ai_service import generate_insight
import logging

router = APIRouter(prefix="/insights", tags=["Insights"])
logger = logging.getLogger(__name__)

def si(doc): doc["id"]=str(doc.pop("_id","")); doc["userId"]=str(doc.get("userId","")); return doc

@router.post("/generate", response_model=ApiResponse)
async def generate(p: GenerateInsightRequest, cu=Depends(get_current_user), db=Depends(get_db)):
    uid=str(cu["_id"]); period=p.period.value
    days={"daily":1,"weekly":7,"monthly":30}.get(period,7)
    since=(datetime.utcnow()-timedelta(days=days+1)).strftime("%Y-%m-%d")
    logs=[l async for l in db.daily_logs.find({"userId":uid,"date":{"$gte":since}}).sort("date",-1).limit(days+2)]
    ems=[e async for e in db.emotion_records.find({"userId":uid,"date":{"$gte":since}}).sort("date",-1).limit(14)]
    data=await generate_insight(period,logs,ems,cu)
    if not data: raise HTTPException(500,"Failed to generate insight")
    today=datetime.utcnow().strftime("%Y-%m-%d")
    doc={"userId":uid,"period":period,"date":today,**data,"createdAt":datetime.utcnow()}
    await db.ai_insights.update_one({"userId":uid,"period":period,"date":today},{"$set":doc},upsert=True)
    saved=await db.ai_insights.find_one({"userId":uid,"period":period,"date":today})
    return ApiResponse(data=si(saved),message="Insight generated")

@router.get("/latest", response_model=ApiResponse)
async def latest(period: str=Query("daily"), cu=Depends(get_current_user), db=Depends(get_db)):
    i=await db.ai_insights.find_one({"userId":str(cu["_id"]),"period":period},sort=[("date",-1)])
    if not i: raise HTTPException(404,"No insight found. Generate one first.")
    return ApiResponse(data=si(i))

@router.get("/history", response_model=ApiResponse)
async def history(cu=Depends(get_current_user), db=Depends(get_db)):
    cur=db.ai_insights.find({"userId":str(cu["_id"])}).sort("date",-1).limit(30)
    return ApiResponse(data=[si(i) async for i in cur])
