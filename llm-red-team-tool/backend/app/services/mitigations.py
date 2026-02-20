MITIGATION_DATABASE: dict[str, dict] = {
    "prompt_injection": {
        "summary": "Prompt injection allows attackers to override model instructions via user input.",
        "immediate_actions": [
            "Implement strict input validation and sanitization",
            "Use delimiters to separate system and user content",
            "Apply XML-tagging or structured prompt formats",
            "Implement a secondary safety classifier to verify outputs",
        ],
        "long_term_actions": [
            "Fine-tune the model on adversarial injection examples",
            "Implement privilege separation (user vs. system commands)",
            "Monitor and log all prompts for anomalous patterns",
        ],
        "references": [
            "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
            "https://arxiv.org/abs/2306.05499",
        ],
    },
    "jailbreaking": {
        "summary": "Jailbreaking bypasses safety guidelines via roleplay, hypotheticals, or manipulation.",
        "immediate_actions": [
            "Apply post-generation safety classifiers",
            "Implement semantic similarity detection against known jailbreak templates",
            "Add rate limiting for repeated safety violations",
        ],
        "long_term_actions": [
            "Retrain with adversarial jailbreak examples (Constitutional AI)",
            "Apply RLHF with human feedback on refusal behavior",
            "Continuously update the jailbreak pattern library",
        ],
        "references": [
            "https://arxiv.org/abs/2307.02483",
            "https://arxiv.org/abs/2308.09662",
        ],
    },
    "data_poisoning": {
        "summary": "Data poisoning introduces malicious examples into training data to influence model behavior.",
        "immediate_actions": [
            "Audit training data sources for suspicious content",
            "Run consistency tests across safety-critical responses",
            "Implement data provenance tracking",
        ],
        "long_term_actions": [
            "Use certified defenses against poisoning attacks",
            "Implement robust training with outlier removal",
            "Apply data filtering pipelines before training",
        ],
        "references": [
            "https://arxiv.org/abs/2212.04431",
        ],
    },
    "model_inversion": {
        "summary": "Model inversion extracts training data or system prompts from model outputs.",
        "immediate_actions": [
            "Never include sensitive data in system prompts",
            "Implement output filtering to detect verbatim training data",
            "Apply system prompt confidentiality instructions",
        ],
        "long_term_actions": [
            "Apply differential privacy (DP-SGD) during training",
            "Implement memorization detection in the training pipeline",
            "Use output perturbation to reduce exact memorization",
        ],
        "references": [
            "https://arxiv.org/abs/2301.13188",
        ],
    },
    "membership_inference": {
        "summary": "Membership inference determines if specific data was in the training set.",
        "immediate_actions": [
            "Calibrate confidence scores to reduce differential signals",
            "Apply output smoothing and uncertainty quantification",
        ],
        "long_term_actions": [
            "Train with differential privacy guarantees",
            "Avoid overfitting to individual training examples",
            "Evaluate MIA risk as part of model release criteria",
        ],
        "references": [
            "https://arxiv.org/abs/1709.01604",
        ],
    },
    "adversarial_examples": {
        "summary": "Adversarial examples use subtle text perturbations to cause misclassification.",
        "immediate_actions": [
            "Normalize Unicode input (NFC/NFKC normalization)",
            "Strip zero-width and non-printing characters",
            "Apply consistent text preprocessing pipeline",
        ],
        "long_term_actions": [
            "Use adversarial training with perturbed examples",
            "Implement input certification against bounded perturbations",
            "Apply ensemble methods to improve robustness",
        ],
        "references": [
            "https://arxiv.org/abs/1907.07355",
        ],
    },
    "bias_fairness": {
        "summary": "Bias causes differential treatment of demographic groups, leading to unfair outcomes.",
        "immediate_actions": [
            "Add bias disclaimers and balanced framing to prompts",
            "Apply post-processing fairness correction on outputs",
            "Monitor outputs for demographic sentiment disparities",
        ],
        "long_term_actions": [
            "Apply counterfactual data augmentation in training",
            "Use adversarial debiasing techniques",
            "Conduct regular fairness audits with diverse evaluators",
        ],
        "references": [
            "https://arxiv.org/abs/2009.09283",
            "https://fairmlbook.org/",
        ],
    },
}


def get_mitigation(vulnerability_type: str) -> dict:
    return MITIGATION_DATABASE.get(
        vulnerability_type,
        {
            "summary": "Unknown vulnerability type.",
            "immediate_actions": [],
            "long_term_actions": [],
            "references": [],
        },
    )
