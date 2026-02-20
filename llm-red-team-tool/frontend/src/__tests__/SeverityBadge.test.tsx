import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SeverityBadge from "@/components/SeverityBadge";

describe("SeverityBadge", () => {
  it("renders the severity label in uppercase", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("renders high severity", () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders medium severity", () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("renders low severity", () => {
    render(<SeverityBadge severity="low" />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("renders info severity", () => {
    render(<SeverityBadge severity="info" />);
    expect(screen.getByText("INFO")).toBeInTheDocument();
  });
});
