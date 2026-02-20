import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    model_config_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("model_configs.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="pending"
    )
    test_types: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    total_tests: Mapped[int] = mapped_column(Integer, default=0)
    completed_tests: Mapped[int] = mapped_column(Integer, default=0)
    vulnerabilities_found: Mapped[int] = mapped_column(Integer, default=0)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    project: Mapped["Project"] = relationship(back_populates="test_runs")  # noqa: F821
    model_config: Mapped["ModelConfig"] = relationship(back_populates="test_runs")  # noqa: F821
    vulnerabilities: Mapped[list["Vulnerability"]] = relationship(  # noqa: F821
        back_populates="test_run", cascade="all, delete-orphan"
    )
