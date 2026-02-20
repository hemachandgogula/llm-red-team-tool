from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/llm_red_team"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-this-to-a-very-long-random-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    cohere_api_key: str = ""

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
