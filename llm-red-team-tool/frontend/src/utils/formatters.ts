export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

export function formatConfidence(c: number): string {
  return `${Math.round(c * 100)}%`;
}

export function formatRiskScore(score: number | null): string {
  if (score === null || score === undefined) return "N/A";
  return score.toFixed(1);
}

export function formatTestTypes(json: string): string {
  try {
    const types = JSON.parse(json) as string[];
    return types.map((t) => t.replace(/_/g, " ")).join(", ") || "—";
  } catch {
    return json;
  }
}

export const VULNERABILITY_TYPE_LABELS: Record<string, string> = {
  prompt_injection: "Prompt Injection",
  jailbreaking: "Jailbreaking",
  data_poisoning: "Data Poisoning",
  model_inversion: "Model Inversion",
  membership_inference: "Membership Inference",
  adversarial_examples: "Adversarial Examples",
  bias_fairness: "Bias & Fairness",
};
