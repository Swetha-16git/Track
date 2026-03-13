"""
Secure Tracker - Main Application Entry Point
A secure vehicle tracking application with Multi-Factor Authentication (MFA)
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from datetime import datetime

from app.config.settings import settings
from app.config.constants import APP_NAME, APP_VERSION, API_PREFIX
from app.database.db_connection import engine, Base
from app.routers import (
    auth_router,
    user_router,
    asset_router,
    tracking_router,
    role_router,
)
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# ✅ LIFESPAN EVENTS
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {APP_NAME} v{APP_VERSION}")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

    yield

    logger.info(f"Shutting down {APP_NAME}")


# ✅ FASTAPI APP
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Secure vehicle tracking application with MFA authentication",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
    lifespan=lifespan,
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ REQUEST LOGGING
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-App-Name"] = APP_NAME
    response.headers["X-App-Version"] = APP_VERSION

    logger.info(
        f"{request.method} {request.url.path} "
        f"- {response.status_code} "
        f"- {process_time:.3f}s"
    )
    return response


# ✅ GLOBAL EXCEPTION HANDLER
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# ✅ ROOT ENDPOINT
@app.get("/", tags=["Root"])
async def root():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "docs": f"{API_PREFIX}/docs",
    }


# ✅ ✅ ROUTER REGISTRATION (ONLY PLACE)
app.include_router(auth_router.router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"])
app.include_router(user_router.router, prefix=f"{API_PREFIX}/users", tags=["Users"])
app.include_router(asset_router.router, prefix=f"{API_PREFIX}/assets", tags=["Assets"])
app.include_router(tracking_router.router, prefix=f"{API_PREFIX}/tracking", tags=["Tracking"])
app.include_router(role_router.router, prefix=f"{API_PREFIX}/roles", tags=["Roles"])


# ✅ LOCAL RUN
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )