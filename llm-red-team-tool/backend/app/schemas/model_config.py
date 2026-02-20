from datetime import datetime

from pydantic import BaseModel


class ModelConfigCreate(BaseModel):
    name: str
    provider: str
    model_id: str
    api_key: str | None = None
    api_base_url: str | None = None
    max_tokens: int | None = 1024
    temperature: float | None = 0.7


class ModelConfigUpdate(BaseModel):
    name: str | None = None
    api_key: str | None = None
    api_base_url: str | None = None
    max_tokens: int | None = None
    temperature: float | None = None


class ModelConfigOut(BaseModel):
    id: str
    name: str
    provider: str
    model_id: str
    api_base_url: str | None
    max_tokens: int | None
    temperature: float | None
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
