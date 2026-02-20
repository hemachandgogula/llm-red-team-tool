from openai import AsyncOpenAI

from app.services.model_providers.base import BaseModelProvider, ModelResponse


class OpenAIProvider(BaseModelProvider):
    def __init__(self, config: dict) -> None:
        self._model_id = config.get("model_id", "gpt-4o-mini")
        self._max_tokens = config.get("max_tokens", 1024)
        self._temperature = config.get("temperature", 0.7)
        api_key = config.get("api_key_encrypted") or config.get("api_key")
        base_url = config.get("api_base_url")
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url if base_url else None,
        )

    def supports_system_prompt(self) -> bool:
        return True

    async def generate(self, prompt: str, system_prompt: str | None = None) -> ModelResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self._client.chat.completions.create(
            model=self._model_id,
            messages=messages,
            max_tokens=self._max_tokens,
            temperature=self._temperature,
        )
        choice = response.choices[0]
        return ModelResponse(
            text=choice.message.content or "",
            prompt_tokens=response.usage.prompt_tokens if response.usage else 0,
            completion_tokens=response.usage.completion_tokens if response.usage else 0,
            model_id=response.model,
        )
