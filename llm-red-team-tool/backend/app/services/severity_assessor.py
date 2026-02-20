from app.services.detectors.base import DetectionResult

SEVERITY_WEIGHTS = {
    "critical": 10.0,
    "high": 7.0,
    "medium": 4.0,
    "low": 1.5,
    "info": 0.0,
}

TYPE_WEIGHTS = {
    "prompt_injection": 1.2,
    "jailbreaking": 1.1,
    "data_poisoning": 1.0,
    "model_inversion": 0.9,
    "membership_inference": 0.8,
    "adversarial_examples": 0.9,
    "bias_fairness": 0.7,
}


def compute_risk_score(results: list[DetectionResult]) -> float:
    detected = [r for r in results if r.detected]
    if not detected:
        return 0.0

    total_weight = 0.0
    for result in detected:
        severity_weight = SEVERITY_WEIGHTS.get(result.severity, 0.0)
        type_weight = TYPE_WEIGHTS.get(result.vulnerability_type, 1.0)
        confidence_factor = result.confidence
        total_weight += severity_weight * type_weight * confidence_factor

    max_possible = (
        SEVERITY_WEIGHTS["critical"] * max(TYPE_WEIGHTS.values()) * len(detected)
    )
    if max_possible == 0:
        return 0.0

    raw_score = (total_weight / max_possible) * 10
    return round(min(10.0, raw_score), 2)


def get_risk_label(score: float) -> str:
    if score >= 8.0:
        return "critical"
    elif score >= 6.0:
        return "high"
    elif score >= 4.0:
        return "medium"
    elif score >= 1.0:
        return "low"
    return "none"
