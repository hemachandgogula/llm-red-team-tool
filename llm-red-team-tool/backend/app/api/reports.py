import csv
import io
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.test_run import TestRun
from app.models.user import User
from app.models.vulnerability import Vulnerability
from app.services.mitigations import get_mitigation
from app.services.severity_assessor import get_risk_label

router = APIRouter()


@router.get("/test-runs/{run_id}/json")
async def export_report_json(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test_run, vulns = await _get_run_and_vulns(run_id, current_user.id, db)

    report = _build_report(test_run, vulns)

    content = json.dumps(report, indent=2, default=str)
    return StreamingResponse(
        io.StringIO(content),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="report_{run_id}.json"'
        },
    )


@router.get("/test-runs/{run_id}/csv")
async def export_report_csv(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test_run, vulns = await _get_run_and_vulns(run_id, current_user.id, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "Type",
            "Severity",
            "Confidence",
            "Title",
            "Description",
            "Prompt",
            "Response",
            "Evidence",
            "Mitigation",
            "False Positive",
            "Created At",
        ]
    )
    for v in vulns:
        writer.writerow(
            [
                v.id,
                v.vulnerability_type,
                v.severity,
                v.confidence,
                v.title,
                v.description,
                v.prompt_used or "",
                (v.model_response or "")[:200],
                v.evidence or "",
                v.mitigation or "",
                v.is_false_positive,
                v.created_at,
            ]
        )

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="report_{run_id}.csv"'
        },
    )


@router.get("/test-runs/{run_id}/summary")
async def get_report_summary(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test_run, vulns = await _get_run_and_vulns(run_id, current_user.id, db)
    return _build_report(test_run, vulns)


async def _get_run_and_vulns(
    run_id: str, user_id: str, db: AsyncSession
) -> tuple[TestRun, list[Vulnerability]]:
    tr_result = await db.execute(select(TestRun).where(TestRun.id == run_id))
    test_run = tr_result.scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found")

    proj_result = await db.execute(
        select(Project).where(
            Project.id == test_run.project_id, Project.owner_id == user_id
        )
    )
    if not proj_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    v_result = await db.execute(
        select(Vulnerability)
        .where(Vulnerability.test_run_id == run_id)
        .order_by(Vulnerability.created_at.desc())
    )
    return test_run, list(v_result.scalars().all())


def _build_report(test_run: TestRun, vulns: list[Vulnerability]) -> dict:
    severity_counts: dict[str, int] = {
        "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0
    }
    type_counts: dict[str, int] = {}
    for v in vulns:
        if not v.is_false_positive:
            severity_counts[v.severity] = severity_counts.get(v.severity, 0) + 1
            type_counts[v.vulnerability_type] = type_counts.get(v.vulnerability_type, 0) + 1

    unique_types = list(type_counts.keys())
    mitigations = {t: get_mitigation(t) for t in unique_types}

    return {
        "report_generated_at": datetime.utcnow().isoformat(),
        "test_run": {
            "id": test_run.id,
            "name": test_run.name,
            "status": test_run.status,
            "risk_score": test_run.risk_score,
            "risk_label": get_risk_label(test_run.risk_score or 0.0),
            "total_tests": test_run.total_tests,
            "vulnerabilities_found": test_run.vulnerabilities_found,
            "started_at": test_run.started_at,
            "completed_at": test_run.completed_at,
        },
        "summary": {
            "total_vulnerabilities": len([v for v in vulns if not v.is_false_positive]),
            "false_positives": len([v for v in vulns if v.is_false_positive]),
            "by_severity": severity_counts,
            "by_type": type_counts,
        },
        "vulnerabilities": [
            {
                "id": v.id,
                "type": v.vulnerability_type,
                "severity": v.severity,
                "confidence": v.confidence,
                "title": v.title,
                "description": v.description,
                "evidence": v.evidence,
                "mitigation": v.mitigation,
                "is_false_positive": v.is_false_positive,
            }
            for v in vulns
        ],
        "mitigations": mitigations,
    }
