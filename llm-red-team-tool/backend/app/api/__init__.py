from fastapi import APIRouter

from app.api import auth, health, model_configs, projects, reports, test_runs, vulnerabilities

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(model_configs.router, prefix="/model-configs", tags=["model-configs"])
api_router.include_router(test_runs.router, prefix="/projects", tags=["test-runs"])
api_router.include_router(vulnerabilities.router, prefix="/vulnerabilities", tags=["vulnerabilities"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
