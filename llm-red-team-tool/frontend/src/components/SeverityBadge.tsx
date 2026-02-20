import Chip from "@mui/material/Chip";

interface Props {
  severity: string;
  size?: "small" | "medium";
}

const COLORS: Record<string, "error" | "warning" | "info" | "success" | "default"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "info",
  info: "success",
};

export default function SeverityBadge({ severity, size = "small" }: Props) {
  return (
    <Chip
      label={severity.toUpperCase()}
      color={COLORS[severity] ?? "default"}
      size={size}
      sx={{ fontWeight: 700, letterSpacing: 0.5 }}
    />
  );
}
