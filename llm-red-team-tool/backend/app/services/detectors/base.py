from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class DetectionResult:
    vulnerability_type: str
    detected: bool
    severity: str
    confidence: float
    title: str
    description: str
    prompt_used: str = ""
    model_response: str = ""
    evidence: str = ""
    mitigation: str = ""
    details: dict = field(default_factory=dict)


class BaseDetector(ABC):
    vulnerability_type: str = "unknown"

    @abstractmethod
    async def detect(
        self,
        provider,
        context: dict | None = None,
    ) -> list[DetectionResult]:
        pass

    def _make_result(
        self,
        detected: bool,
        severity: str,
        confidence: float,
        title: str,
        description: str,
        prompt_used: str = "",
        model_response: str = "",
        evidence: str = "",
        mitigation: str = "",
        details: dict | None = None,
    ) -> DetectionResult:
        return DetectionResult(
            vulnerability_type=self.vulnerability_type,
            detected=detected,
            severity=severity,
            confidence=confidence,
            title=title,
            description=description,
            prompt_used=prompt_used,
            model_response=model_response,
            evidence=evidence,
            mitigation=mitigation,
            details=details or {},
        )
