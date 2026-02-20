from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.model_config import ModelConfig
from app.models.user import User
from app.schemas.model_config import ModelConfigCreate, ModelConfigOut, ModelConfigUpdate

router = APIRouter()


@router.get("", response_model=list[ModelConfigOut])
async def list_model_configs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ModelConfig)
        .where(ModelConfig.owner_id == current_user.id)
        .order_by(ModelConfig.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ModelConfigOut, status_code=status.HTTP_201_CREATED)
async def create_model_config(
    payload: ModelConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude={"api_key"})
    if payload.api_key:
        data["api_key_encrypted"] = payload.api_key
    config = ModelConfig(**data, owner_id=current_user.id)
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return config


@router.get("/{config_id}", response_model=ModelConfigOut)
async def get_model_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ModelConfig).where(
            ModelConfig.id == config_id, ModelConfig.owner_id == current_user.id
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model config not found")
    return config


@router.put("/{config_id}", response_model=ModelConfigOut)
async def update_model_config(
    config_id: str,
    payload: ModelConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ModelConfig).where(
            ModelConfig.id == config_id, ModelConfig.owner_id == current_user.id
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model config not found")
    data = payload.model_dump(exclude_none=True, exclude={"api_key"})
    if payload.api_key is not None:
        data["api_key_encrypted"] = payload.api_key
    for field, value in data.items():
        setattr(config, field, value)
    await db.commit()
    await db.refresh(config)
    return config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ModelConfig).where(
            ModelConfig.id == config_id, ModelConfig.owner_id == current_user.id
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model config not found")
    await db.delete(config)
    await db.commit()
