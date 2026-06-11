from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING, DESCENDING
import logging
from config import settings

logger = logging.getLogger(__name__)
client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB]
    await create_indexes()
    logger.info("MongoDB connected")

async def disconnect_db():
    global client
    if client:
        client.close()

async def create_indexes():
    await db.users.create_indexes([
        IndexModel([("email", ASCENDING)], unique=True),
        IndexModel([("createdAt", DESCENDING)]),
    ])
    await db.daily_logs.create_indexes([
        IndexModel([("userId", ASCENDING), ("date", DESCENDING)], unique=True),
    ])
    await db.emotion_records.create_indexes([
        IndexModel([("userId", ASCENDING), ("date", DESCENDING)]),
    ])
    await db.ai_insights.create_indexes([
        IndexModel([("userId", ASCENDING), ("period", ASCENDING), ("date", DESCENDING)]),
    ])
    await db.habits.create_indexes([IndexModel([("userId", ASCENDING)])])
    logger.info("Indexes created")

def get_db() -> AsyncIOMotorDatabase:
    return db
