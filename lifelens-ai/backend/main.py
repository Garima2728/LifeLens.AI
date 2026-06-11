"""LifeLens AI — FastAPI Backend"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from config import settings
from database import connect_db, disconnect_db
from api.auth import router as auth_router
from api.logs import router as logs_router
from api.insights import router as insights_router
from api.emotion import router as emotion_router
from api.users import router as users_router

logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db(); yield; await disconnect_db()

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None, lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.exception_handler(RequestValidationError)
async def val_err(req: Request, exc):
    errs=[f'{" > ".join(str(x) for x in e["loc"] if x!="body")}: {e["msg"]}' for e in exc.errors()]
    return JSONResponse(422,{"success":False,"message":"; ".join(errs),"data":None})

@app.exception_handler(Exception)
async def global_err(req: Request, exc):
    logging.getLogger("lifelens").error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(500,{"success":False,"message":"Internal server error","data":None})

P="/api/v1"
app.include_router(auth_router,     prefix=P)
app.include_router(logs_router,     prefix=P)
app.include_router(insights_router, prefix=P)
app.include_router(emotion_router,  prefix=P)
app.include_router(users_router,    prefix=P)

@app.get("/health")
async def health(): return {"status":"healthy","app":settings.APP_NAME,"version":settings.APP_VERSION}

@app.get("/")
async def root(): return {"message":f"Welcome to {settings.APP_NAME} API","docs":"/docs"}

if __name__=="__main__":
    import uvicorn
    uvicorn.run("main:app",host="0.0.0.0",port=8000,reload=settings.DEBUG)
