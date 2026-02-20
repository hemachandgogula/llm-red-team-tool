from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.cache import close_redis
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


def create_application() -> FastAPI:
    app = FastAPI(
        title="LLM Red Team Tool API",
        description="AI/ML Model Security Testing Platform for LLMs",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_application()
