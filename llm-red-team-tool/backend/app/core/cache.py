import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    redis = await get_redis()
    await redis.setex(key, ttl, json.dumps(value))


async def cache_get(key: str) -> Any | None:
    redis = await get_redis()
    data = await redis.get(key)
    if data is None:
        return None
    return json.loads(data)


async def cache_delete(key: str) -> None:
    redis = await get_redis()
    await redis.delete(key)
