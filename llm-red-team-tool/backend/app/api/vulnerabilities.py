from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.test_run import TestRun
from app.models.user import User
from app.models.vulnerability import Vulnerability
from app.schemas.vulnerability import VulnerabilityOut, VulnerabilityUpdate

router = APIRouter()


@router.get("/test-runs/{run_id}", response_model=list[VulnerabilityOut])
async def list_vulnerabilities(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tr_result = await db.execute(select(TestRun).where(TestRun.id == run_id))
    test_run = tr_result.scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found")

    proj_result = await db.execute(
        select(Project).where(
            Project.id == test_run.project_id, Project.owner_id == current_user.id
        )
    )
    if not proj_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = await db.execute(
        select(Vulnerability)
        .where(Vulnerability.test_run_id == run_id)
        .order_by(Vulnerability.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{vuln_id}", response_model=VulnerabilityOut)
async def get_vulnerability(
    vuln_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vulnerability).where(Vulnerability.id == vuln_id)
    )
    vuln = result.scalar_one_or_none()
    if not vuln:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")

    tr_result = await db.execute(select(TestRun).where(TestRun.id == vuln.test_run_id))
    test_run = tr_result.scalar_one_or_none()
    proj_result = await db.execute(
        select(Project).where(
            Project.id == test_run.project_id, Project.owner_id == current_user.id
        )
    )
    if not proj_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return vuln


@router.patch("/{vuln_id}", response_model=VulnerabilityOut)
async def update_vulnerability(
    vuln_id: str,
    payload: VulnerabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vulnerability).where(Vulnerability.id == vuln_id)
    )
    vuln = result.scalar_one_or_none()
    if not vuln:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")

    tr_result = await db.execute(select(TestRun).where(TestRun.id == vuln.test_run_id))
    test_run = tr_result.scalar_one_or_none()
    proj_result = await db.execute(
        select(Project).where(
            Project.id == test_run.project_id, Project.owner_id == current_user.id
        )
    )
    if not proj_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(vuln, field, value)
    await db.commit()
    await db.refresh(vuln)
    return vuln
