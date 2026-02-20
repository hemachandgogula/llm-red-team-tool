from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ModelResponse:
    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model_id: str = ""
    raw: dict | None = None


class BaseModelProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str | None = None) -> ModelResponse:
        pass

    @abstractmethod
    def supports_system_prompt(self) -> bool:
        pass

    @classmethod
    def from_config(cls, config: dict) -> "BaseModelProvider":
        provider = config.get("provider", "").lower()
        if provider == "openai":
            from app.services.model_providers.openai_provider import OpenAIProvider
            return OpenAIProvider(config)
        elif provider == "anthropic":
            from app.services.model_providers.anthropic_provider import AnthropicProvider
            return AnthropicProvider(config)
        elif provider == "huggingface":
            from app.services.model_providers.huggingface_provider import HuggingFaceProvider
            return HuggingFaceProvider(config)
        elif provider == "custom":
            from app.services.model_providers.custom_provider import CustomProvider
            return CustomProvider(config)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
