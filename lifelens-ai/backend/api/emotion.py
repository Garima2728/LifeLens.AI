from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timedelta
from database import get_db
from models.schemas import EmotionAnalyzeRequest, EmotionSummaryCreate, ApiResponse
from utils.auth import get_current_user
from services.emotion_service import analyse_emotion

router = APIRouter(prefix="/emotion", tags=["Emotion"])

@router.post("/analyze", response_model=ApiResponse)
async def analyze(p: EmotionAnalyzeRequest, cu=Depends(get_current_user)):
    if len(p.image)>2_000_000: raise HTTPException(413,"Image too large")
    result=await analyse_emotion(p.image)
    return ApiResponse(data=result)

@router.post("/summary", response_model=ApiResponse)
async def summary(p: EmotionSummaryCreate, cu=Depends(get_current_user), db=Depends(get_db)):
    uid=str(cu["_id"])
    doc={"userId":uid,"date":p.date,"dominantEmotion":p.dominantEmotion.value,
        "emotionDistribution":p.emotionDistribution,"confidence":p.confidence,
        "samplesCount":p.samplesCount,"createdAt":datetime.utcnow()}
    await db.emotion_records.update_one({"userId":uid,"date":p.date},{"$set":doc},upsert=True)
    saved=await db.emotion_records.find_one({"userId":uid,"date":p.date})
    if saved: saved["id"]=str(saved.pop("_id"))
    return ApiResponse(data=saved)

@router.get("/history", response_model=ApiResponse)
async def hist(days: int=Query(14,ge=1,le=90), cu=Depends(get_current_user), db=Depends(get_db)):
    since=(datetime.utcnow()-timedelta(days=days)).strftime("%Y-%m-%d")
    cur=db.emotion_records.find({"userId":str(cu["_id"]),"date":{"$gte":since}}).sort("date",-1).limit(days)
    records=[]
    async for r in cur:
        r["id"]=str(r.pop("_id")); records.append(r)
    return ApiResponse(data=records)
