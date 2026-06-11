from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class Emotion(str, Enum):
    happy="happy"; neutral="neutral"; sad="sad"
    angry="angry"; stressed="stressed"; surprised="surprised"

class MealType(str, Enum):
    breakfast="breakfast"; lunch="lunch"; dinner="dinner"; snack="snack"

class DietQuality(str, Enum):
    excellent="excellent"; good="good"; fair="fair"; poor="poor"

class SocialLevel(str, Enum):
    none="none"; minimal="minimal"; moderate="moderate"; high="high"

class ViewPeriod(str, Enum):
    daily="daily"; weekly="weekly"; monthly="monthly"

class LifestylePreferences(BaseModel):
    activityLevel: str = "moderate"
    dietType: str = "omnivore"
    sleepGoal: float = 8.0
    workHoursGoal: float = 8.0
    exerciseGoal: int = 30

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    age: Optional[int] = Field(None, ge=13, le=120)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    goals: Optional[List[str]] = None
    lifestyle: Optional[LifestylePreferences] = None

class Meal(BaseModel):
    type: MealType
    time: str
    description: str
    quality: DietQuality
    calories: Optional[int] = None

class DayScores(BaseModel):
    health: float = 0; productivity: float = 0; mood: float = 0
    sleep: float = 0; diet: float = 0; overall: float = 0

class DailyLogCreate(BaseModel):
    date: str
    wakeTime: str; sleepTime: str
    sleepDuration: Optional[float] = None
    workHours: float = Field(ge=0, le=18)
    studyHours: float = Field(ge=0, le=12, default=0)
    screenTime: float = Field(ge=0, le=18, default=4)
    exerciseMinutes: int = Field(ge=0, le=300, default=0)
    exerciseType: Optional[str] = None
    meals: List[Meal] = []
    socialInteraction: SocialLevel = SocialLevel.moderate
    waterIntake: float = Field(ge=0, le=6, default=2)
    stressLevel: int = Field(ge=1, le=10, default=5)
    notes: Optional[str] = None

class DailyLogUpdate(BaseModel):
    wakeTime: Optional[str] = None; sleepTime: Optional[str] = None
    workHours: Optional[float] = None; screenTime: Optional[float] = None
    exerciseMinutes: Optional[int] = None; meals: Optional[List[Meal]] = None
    stressLevel: Optional[int] = None; notes: Optional[str] = None

class EmotionAnalyzeRequest(BaseModel):
    image: str

class EmotionSummaryCreate(BaseModel):
    date: str; dominantEmotion: Emotion
    emotionDistribution: Dict[str, float]
    confidence: float; samplesCount: int = 1

class GenerateInsightRequest(BaseModel):
    period: ViewPeriod

class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    category: str; targetDays: int = Field(ge=1, le=7)
    color: str = "#7C3AED"; icon: str = "✓"

class HabitComplete(BaseModel):
    date: str

class ApiResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Any = None
