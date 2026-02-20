import httpx

from app.services.model_providers.base import BaseModelProvider, ModelResponse


class CustomProvider(BaseModelProvider):
    def __init__(self, config: dict) -> None:
        self._model_id = config.get("model_id", "custom")
        self._max_tokens = config.get("max_tokens", 1024)
        self._temperature = config.get("temperature", 0.7)
        self._api_url = config.get("api_base_url", "")
        api_key = config.get("api_key_encrypted") or config.get("api_key", "")
        self._headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def supports_system_prompt(self) -> bool:
        return True

    async def generate(self, prompt: str, system_prompt: str | None = None) -> ModelResponse:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self._model_id,
            "messages": messages,
            "max_tokens": self._max_tokens,
            "temperature": self._temperature,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(self._api_url, json=payload, headers=self._headers)
            resp.raise_for_status()
            data = resp.json()

        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return ModelResponse(text=text, model_id=self._model_id)
