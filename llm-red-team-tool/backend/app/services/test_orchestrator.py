import json
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.model_config import ModelConfig
from app.models.test_run import TestRun
from app.models.vulnerability import Vulnerability
from app.services.detectors.adversarial_examples import AdversarialExamplesDetector
from app.services.detectors.base import DetectionResult
from app.services.detectors.bias_fairness import BiasFairnessDetector
from app.services.detectors.data_poisoning import DataPoisoningDetector
from app.services.detectors.jailbreaking import JailbreakingDetector
from app.services.detectors.membership_inference import MembershipInferenceDetector
from app.services.detectors.model_inversion import ModelInversionDetector
from app.services.detectors.prompt_injection import PromptInjectionDetector
from app.services.mitigations import get_mitigation
from app.services.model_providers.base import BaseModelProvider
from app.services.severity_assessor import compute_risk_score

DETECTOR_MAP = {
    "prompt_injection": PromptInjectionDetector,
    "jailbreaking": JailbreakingDetector,
    "data_poisoning": DataPoisoningDetector,
    "model_inversion": ModelInversionDetector,
    "membership_inference": MembershipInferenceDetector,
    "adversarial_examples": AdversarialExamplesDetector,
    "bias_fairness": BiasFairnessDetector,
}

ALL_TEST_TYPES = list(DETECTOR_MAP.keys())


async def run_test(
    test_run: TestRun,
    model_config: ModelConfig,
    db: AsyncSession,
) -> None:
    test_run.status = "running"
    test_run.started_at = datetime.now(timezone.utc)

    try:
        test_types = json.loads(test_run.test_types)
    except Exception:
        test_types = ALL_TEST_TYPES

    if not test_types:
        test_types = ALL_TEST_TYPES

    config_dict = {
        "provider": model_config.provider,
        "model_id": model_config.model_id,
        "api_key_encrypted": model_config.api_key_encrypted,
        "api_base_url": model_config.api_base_url,
        "max_tokens": model_config.max_tokens,
        "temperature": model_config.temperature,
    }

    try:
        provider: BaseModelProvider = BaseModelProvider.from_config(config_dict)
    except ValueError as exc:
        test_run.status = "failed"
        test_run.error_message = str(exc)
        test_run.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return

    all_results: list[DetectionResult] = []
    total = len(test_types)
    test_run.total_tests = total
    await db.commit()

    for i, test_type in enumerate(test_types):
        detector_class = DETECTOR_MAP.get(test_type)
        if not detector_class:
            continue

        detector = detector_class()
        try:
            results = await detector.detect(provider)
        except Exception:
            results = []

        for result in results:
            if result.detected:
                mitigation_info = get_mitigation(result.vulnerability_type)
                full_mitigation = (
                    result.mitigation
                    or mitigation_info.get("summary", "")
                )
                vuln = Vulnerability(
                    test_run_id=test_run.id,
                    vulnerability_type=result.vulnerability_type,
                    severity=result.severity,
                    confidence=result.confidence,
                    title=result.title,
                    description=result.description,
                    prompt_used=result.prompt_used,
                    model_response=result.model_response,
                    evidence=result.evidence,
                    mitigation=full_mitigation,
                )
                db.add(vuln)
                test_run.vulnerabilities_found += 1

        all_results.extend(results)
        test_run.completed_tests = i + 1
        await db.commit()

    test_run.risk_score = compute_risk_score(all_results)
    test_run.status = "completed"
    test_run.completed_at = datetime.now(timezone.utc)
    await db.commit()


async def run_interactive_test(
    model_config: ModelConfig,
    prompt: str,
    test_types: list[str] | None,
) -> dict:
    if not test_types:
        test_types = ["prompt_injection", "jailbreaking"]

    config_dict = {
        "provider": model_config.provider,
        "model_id": model_config.model_id,
        "api_key_encrypted": model_config.api_key_encrypted,
        "api_base_url": model_config.api_base_url,
        "max_tokens": model_config.max_tokens,
        "temperature": model_config.temperature,
    }

    provider = BaseModelProvider.from_config(config_dict)

    response = await provider.generate(prompt)

    all_results: list[DetectionResult] = []
    for test_type in test_types:
        detector_class = DETECTOR_MAP.get(test_type)
        if not detector_class:
            continue
        detector = detector_class()
        try:
            results = await detector.detect(provider)
            all_results.extend(results)
        except Exception:
            pass

    detected = [r for r in all_results if r.detected]
    risk_score = compute_risk_score(all_results)

    return {
        "prompt": prompt,
        "response": response.text,
        "risk_score": risk_score,
        "vulnerabilities": [
            {
                "vulnerability_type": r.vulnerability_type,
                "severity": r.severity,
                "confidence": r.confidence,
                "title": r.title,
                "description": r.description,
                "evidence": r.evidence,
                "mitigation": r.mitigation,
            }
            for r in detected
        ],
    }
