import anthropic

from app.services.model_providers.base import BaseModelProvider, ModelResponse


class AnthropicProvider(BaseModelProvider):
    def __init__(self, config: dict) -> None:
        self._model_id = config.get("model_id", "claude-3-haiku-20240307")
        self._max_tokens = config.get("max_tokens", 1024)
        self._temperature = config.get("temperature", 0.7)
        api_key = config.get("api_key_encrypted") or config.get("api_key")
        self._client = anthropic.AsyncAnthropic(api_key=api_key)

    def supports_system_prompt(self) -> bool:
        return True

    async def generate(self, prompt: str, system_prompt: str | None = None) -> ModelResponse:
        kwargs: dict = {
            "model": self._model_id,
            "max_tokens": self._max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self._client.messages.create(**kwargs)
        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text += block.text

        return ModelResponse(
            text=text,
            prompt_tokens=response.usage.input_tokens,
            completion_tokens=response.usage.output_tokens,
            model_id=response.model,
        )
