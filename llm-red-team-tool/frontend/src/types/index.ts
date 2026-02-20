export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_base_url: string | null;
  max_tokens: number | null;
  temperature: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TestRun {
  id: string;
  name: string;
  project_id: string;
  model_config_id: string | null;
  status: "pending" | "running" | "completed" | "failed";
  test_types: string;
  total_tests: number;
  completed_tests: number;
  vulnerabilities_found: number;
  risk_score: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Vulnerability {
  id: string;
  test_run_id: string;
  vulnerability_type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  confidence: number;
  title: string;
  description: string;
  prompt_used: string | null;
  model_response: string | null;
  evidence: string | null;
  mitigation: string | null;
  is_false_positive: boolean;
  created_at: string;
}

export interface InteractiveTestResult {
  prompt: string;
  response: string;
  risk_score: number;
  vulnerabilities: Array<{
    vulnerability_type: string;
    severity: string;
    confidence: number;
    title: string;
    description: string;
    evidence: string | null;
    mitigation: string | null;
  }>;
}

export interface TestRunProgress {
  test_run_id: string;
  status: string;
  total_tests: number;
  completed_tests: number;
  vulnerabilities_found: number;
  progress_percent: number;
}

export type VulnerabilityType =
  | "prompt_injection"
  | "jailbreaking"
  | "data_poisoning"
  | "model_inversion"
  | "membership_inference"
  | "adversarial_examples"
  | "bias_fairness";

export const ALL_TEST_TYPES: { value: VulnerabilityType; label: string }[] = [
  { value: "prompt_injection", label: "Prompt Injection" },
  { value: "jailbreaking", label: "Jailbreaking" },
  { value: "data_poisoning", label: "Data Poisoning" },
  { value: "model_inversion", label: "Model Inversion" },
  { value: "membership_inference", label: "Membership Inference" },
  { value: "adversarial_examples", label: "Adversarial Examples" },
  { value: "bias_fairness", label: "Bias & Fairness" },
];
