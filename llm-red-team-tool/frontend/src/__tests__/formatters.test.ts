import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDuration,
  formatConfidence,
  formatRiskScore,
  formatTestTypes,
} from "@/utils/formatters";

describe("formatDate", () => {
  it("returns em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a valid ISO string", () => {
    const result = formatDate("2024-01-15T10:30:00.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("—");
  });
});

describe("formatDuration", () => {
  it("returns em dash when both are null", () => {
    expect(formatDuration(null, null)).toBe("—");
  });

  it("formats seconds", () => {
    const start = "2024-01-01T00:00:00.000Z";
    const end = "2024-01-01T00:00:45.000Z";
    expect(formatDuration(start, end)).toBe("45s");
  });

  it("formats minutes and seconds", () => {
    const start = "2024-01-01T00:00:00.000Z";
    const end = "2024-01-01T00:02:30.000Z";
    expect(formatDuration(start, end)).toBe("2m 30s");
  });
});

describe("formatConfidence", () => {
  it("converts decimal to percentage", () => {
    expect(formatConfidence(0.95)).toBe("95%");
    expect(formatConfidence(0.5)).toBe("50%");
    expect(formatConfidence(1.0)).toBe("100%");
  });
});

describe("formatRiskScore", () => {
  it("returns N/A for null", () => {
    expect(formatRiskScore(null)).toBe("N/A");
  });

  it("formats score with one decimal", () => {
    expect(formatRiskScore(7.5)).toBe("7.5");
    expect(formatRiskScore(0)).toBe("0.0");
  });
});

describe("formatTestTypes", () => {
  it("parses JSON array and replaces underscores", () => {
    const result = formatTestTypes('["prompt_injection","jailbreaking"]');
    expect(result).toBe("prompt injection, jailbreaking");
  });

  it("returns em dash for empty array", () => {
    expect(formatTestTypes("[]")).toBe("—");
  });

  it("returns raw string for invalid JSON", () => {
    expect(formatTestTypes("invalid")).toBe("invalid");
  });
});
