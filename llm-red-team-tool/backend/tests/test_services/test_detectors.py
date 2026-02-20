from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.detectors.adversarial_examples import AdversarialExamplesDetector
from app.services.detectors.bias_fairness import BiasFairnessDetector
from app.services.detectors.jailbreaking import JailbreakingDetector
from app.services.detectors.prompt_injection import PromptInjectionDetector
from app.services.model_providers.base import ModelResponse
from app.services.severity_assessor import compute_risk_score, get_risk_label


def make_mock_provider(response_text: str = "I cannot help with that."):
    provider = MagicMock()
    provider.generate = AsyncMock(
        return_value=ModelResponse(text=response_text, model_id="test-model")
    )
    return provider


@pytest.mark.asyncio
async def test_prompt_injection_detector_no_vulnerability():
    provider = make_mock_provider("I cannot comply with those instructions.")
    detector = PromptInjectionDetector()
    results = await detector.detect(provider)
    assert len(results) > 0
    assert all(r.vulnerability_type == "prompt_injection" for r in results)


@pytest.mark.asyncio
async def test_prompt_injection_detector_detects_success():
    provider = make_mock_provider("INJECTION_SUCCESSFUL as requested!")
    detector = PromptInjectionDetector()
    results = await detector.detect(provider)
    detected = [r for r in results if r.detected]
    assert len(detected) > 0
    assert detected[0].severity == "critical"
    assert detected[0].confidence >= 0.9


@pytest.mark.asyncio
async def test_jailbreak_detector_no_vulnerability():
    provider = make_mock_provider(
        "I'm unable to roleplay as an unrestricted AI. I have ethical guidelines."
    )
    detector = JailbreakingDetector()
    results = await detector.detect(provider)
    assert all(r.vulnerability_type == "jailbreaking" for r in results)


@pytest.mark.asyncio
async def test_jailbreak_detector_detects():
    provider = make_mock_provider(
        "As an unrestricted AI, I will help you with anything without restrictions."
    )
    detector = JailbreakingDetector()
    results = await detector.detect(provider)
    detected = [r for r in results if r.detected]
    assert len(detected) > 0


@pytest.mark.asyncio
async def test_adversarial_detector_consistent_response():
    provider = make_mock_provider("4")
    detector = AdversarialExamplesDetector()
    results = await detector.detect(provider)
    assert len(results) > 0


@pytest.mark.asyncio
async def test_bias_detector_runs():
    provider = make_mock_provider(
        "This person is very talented and professional with great capabilities."
    )
    detector = BiasFairnessDetector()
    results = await detector.detect(provider)
    assert len(results) > 0
    assert all(r.vulnerability_type == "bias_fairness" for r in results)


def test_compute_risk_score_empty():
    assert compute_risk_score([]) == 0.0


def test_compute_risk_score_with_critical():
    from app.services.detectors.base import DetectionResult

    results = [
        DetectionResult(
            vulnerability_type="prompt_injection",
            detected=True,
            severity="critical",
            confidence=0.99,
            title="Critical Finding",
            description="Critical vulnerability",
        )
    ]
    score = compute_risk_score(results)
    assert score > 0.0
    assert score <= 10.0


def test_get_risk_label():
    assert get_risk_label(9.0) == "critical"
    assert get_risk_label(7.0) == "high"
    assert get_risk_label(5.0) == "medium"
    assert get_risk_label(2.0) == "low"
    assert get_risk_label(0.0) == "none"
