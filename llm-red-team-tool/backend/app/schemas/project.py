from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProjectOut(BaseModel):
    id: str
    name: str
    description: str | None
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
