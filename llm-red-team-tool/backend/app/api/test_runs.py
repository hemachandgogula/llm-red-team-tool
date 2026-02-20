import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.model_config import ModelConfig
from app.models.project import Project
from app.models.test_run import TestRun
from app.models.user import User
from app.schemas.test_run import (
    InteractiveTestRequest,
    InteractiveTestResult,
    TestRunCreate,
    TestRunOut,
    TestRunProgress,
)
from app.services.test_orchestrator import run_interactive_test, run_test

router = APIRouter()


async def _get_project_or_404(
    project_id: str, user_id: str, db: AsyncSession
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == user_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/{project_id}/test-runs", response_model=list[TestRunOut])
async def list_test_runs(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user.id, db)
    result = await db.execute(
        select(TestRun)
        .where(TestRun.project_id == project_id)
        .order_by(TestRun.created_at.desc())
    )
    return result.scalars().all()


@router.post(
    "/{project_id}/test-runs",
    response_model=TestRunOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_test_run(
    project_id: str,
    payload: TestRunCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user.id, db)

    mc_result = await db.execute(
        select(ModelConfig).where(
            ModelConfig.id == payload.model_config_id,
            ModelConfig.owner_id == current_user.id,
        )
    )
    model_config = mc_result.scalar_one_or_none()
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model config not found"
        )

    test_run = TestRun(
        name=payload.name,
        project_id=project_id,
        model_config_id=payload.model_config_id,
        test_types=json.dumps(payload.test_types),
        status="pending",
    )
    db.add(test_run)
    await db.commit()
    await db.refresh(test_run)

    background_tasks.add_task(_run_test_background, test_run.id, model_config.id)

    return test_run


async def _run_test_background(test_run_id: str, model_config_id: str) -> None:
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        tr_result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
        test_run = tr_result.scalar_one_or_none()
        mc_result = await db.execute(
            select(ModelConfig).where(ModelConfig.id == model_config_id)
        )
        model_config = mc_result.scalar_one_or_none()

        if test_run and model_config:
            await run_test(test_run, model_config, db)


@router.get("/{project_id}/test-runs/{run_id}", response_model=TestRunOut)
async def get_test_run(
    project_id: str,
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user.id, db)
    result = await db.execute(
        select(TestRun).where(TestRun.id == run_id, TestRun.project_id == project_id)
    )
    test_run = result.scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found")
    return test_run


@router.get("/{project_id}/test-runs/{run_id}/progress", response_model=TestRunProgress)
async def get_test_run_progress(
    project_id: str,
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_project_or_404(project_id, current_user.id, db)
    result = await db.execute(
        select(TestRun).where(TestRun.id == run_id, TestRun.project_id == project_id)
    )
    test_run = result.scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found")

    progress = 0.0
    if test_run.total_tests > 0:
        progress = (test_run.completed_tests / test_run.total_tests) * 100

    return TestRunProgress(
        test_run_id=test_run.id,
        status=test_run.status,
        total_tests=test_run.total_tests,
        completed_tests=test_run.completed_tests,
        vulnerabilities_found=test_run.vulnerabilities_found,
        progress_percent=round(progress, 1),
    )


@router.post("/interactive-test", response_model=InteractiveTestResult)
async def interactive_test(
    payload: InteractiveTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mc_result = await db.execute(
        select(ModelConfig).where(
            ModelConfig.id == payload.model_config_id,
            ModelConfig.owner_id == current_user.id,
        )
    )
    model_config = mc_result.scalar_one_or_none()
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model config not found"
        )

    result = await run_interactive_test(
        model_config=model_config,
        prompt=payload.prompt,
        test_types=payload.test_types,
    )
    return InteractiveTestResult(**result)
