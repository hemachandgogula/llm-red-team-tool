from datetime import datetime

from pydantic import BaseModel


class TestRunCreate(BaseModel):
    name: str
    model_config_id: str
    test_types: list[str]


class InteractiveTestRequest(BaseModel):
    model_config_id: str
    prompt: str
    test_types: list[str] | None = None


class InteractiveTestResult(BaseModel):
    prompt: str
    response: str
    vulnerabilities: list[dict]
    risk_score: float


class TestRunOut(BaseModel):
    id: str
    name: str
    project_id: str
    model_config_id: str | None
    status: str
    test_types: str
    total_tests: int
    completed_tests: int
    vulnerabilities_found: int
    risk_score: float | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TestRunProgress(BaseModel):
    test_run_id: str
    status: str
    total_tests: int
    completed_tests: int
    vulnerabilities_found: int
    progress_percent: float
