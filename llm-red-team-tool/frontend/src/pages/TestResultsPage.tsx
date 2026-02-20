import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
} from "@mui/material";
import { ExpandMore, Download, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { testRunsApi, vulnerabilitiesApi } from "@/api/testRuns";
import SeverityBadge from "@/components/SeverityBadge";
import {
  formatDate,
  formatDuration,
  formatConfidence,
  formatRiskScore,
  formatTestTypes,
  VULNERABILITY_TYPE_LABELS,
} from "@/utils/formatters";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SEVERITY_CHART_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  info: "#10b981",
};

export default function TestResultsPage() {
  const { projectId, runId } = useParams<{ projectId: string; runId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: testRun, isLoading: runLoading } = useQuery({
    queryKey: ["testRun", projectId, runId],
    queryFn: () => testRunsApi.get(projectId!, runId!),
    enabled: !!projectId && !!runId,
    refetchInterval: (query) => {
      const run = query.state.data;
      return run?.status === "running" || run?.status === "pending" ? 3000 : false;
    },
  });

  const { data: vulnerabilities = [], isLoading: vulnsLoading } = useQuery({
    queryKey: ["vulnerabilities", runId],
    queryFn: () => vulnerabilitiesApi.listForRun(runId!),
    enabled: !!runId,
  });

  const fpMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      vulnerabilitiesApi.update(id, { is_false_positive: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vulnerabilities", runId] }),
  });

  if (runLoading) return <LinearProgress />;
  if (!testRun) return <Alert severity="error">Test run not found</Alert>;

  const detected = vulnerabilities.filter((v) => !v.is_false_positive);
  const sevCounts = detected.reduce<Record<string, number>>((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(sevCounts).map(([name, value]) => ({ name, value }));

  const typeCounts = detected.reduce<Record<string, number>>((acc, v) => {
    const label = VULNERABILITY_TYPE_LABELS[v.vulnerability_type] ?? v.vulnerability_type;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const riskColor =
    (testRun.risk_score ?? 0) >= 7
      ? "error.main"
      : (testRun.risk_score ?? 0) >= 4
      ? "warning.main"
      : "success.main";

  const handleExportCSV = () => {
    window.open(`/api/v1/reports/test-runs/${runId}/csv`, "_blank");
  };

  const handleExportJSON = () => {
    window.open(`/api/v1/reports/test-runs/${runId}/json`, "_blank");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {testRun.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTestTypes(testRun.test_types)}
          </Typography>
        </Box>
        <Button startIcon={<Download />} variant="outlined" size="small" onClick={handleExportCSV}>
          CSV
        </Button>
        <Button startIcon={<Download />} variant="outlined" size="small" onClick={handleExportJSON}>
          JSON
        </Button>
      </Box>

      {(testRun.status === "running" || testRun.status === "pending") && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Running security tests…
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {testRun.completed_tests} / {testRun.total_tests || "?"} checks
              </Typography>
            </Box>
            <LinearProgress
              variant={testRun.total_tests > 0 ? "determinate" : "indeterminate"}
              value={testRun.total_tests > 0 ? (testRun.completed_tests / testRun.total_tests) * 100 : undefined}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      )}

      {testRun.status === "failed" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Test run failed: {testRun.error_message || "Unknown error"}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Status", value: <Chip label={testRun.status} color={testRun.status === "completed" ? "success" : testRun.status === "failed" ? "error" : "default"} /> },
          { label: "Risk Score", value: <Typography variant="h5" fontWeight={700} color={riskColor}>{formatRiskScore(testRun.risk_score)} / 10</Typography> },
          { label: "Vulnerabilities", value: <Typography variant="h5" fontWeight={700}>{testRun.vulnerabilities_found}</Typography> },
          { label: "Duration", value: <Typography>{formatDuration(testRun.started_at, testRun.completed_at)}</Typography> },
          { label: "Completed", value: <Typography variant="body2">{formatDate(testRun.completed_at)}</Typography> },
        ].map(({ label, value }) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: "12px !important" }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {label}
                </Typography>
                {value}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {detected.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: 280 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  By Severity
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_CHART_COLORS[entry.name] ?? "#6366f1"} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: 280 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  By Vulnerability Type
                </Typography>
                {Object.entries(typeCounts).map(([type, count]) => (
                  <Box key={type} sx={{ display: "flex", alignItems: "center", mb: 1, gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 180 }}>
                      {type}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(count / detected.length) * 100}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 24, textAlign: "right" }}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Vulnerability Findings ({vulnerabilities.length})
      </Typography>

      {vulnsLoading && <LinearProgress />}

      {!vulnsLoading && vulnerabilities.length === 0 && testRun.status === "completed" && (
        <Alert severity="success">No vulnerabilities detected in this test run.</Alert>
      )}

      {vulnerabilities.map((vuln) => (
        <Accordion
          key={vuln.id}
          sx={{ mb: 1, opacity: vuln.is_false_positive ? 0.5 : 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", pr: 2 }}>
              <SeverityBadge severity={vuln.severity} />
              <Typography fontWeight={500} sx={{ flexGrow: 1 }}>
                {vuln.title}
              </Typography>
              <Chip
                label={VULNERABILITY_TYPE_LABELS[vuln.vulnerability_type] ?? vuln.vulnerability_type}
                size="small"
                variant="outlined"
              />
              <Chip label={`${formatConfidence(vuln.confidence)}`} size="small" />
              {vuln.is_false_positive && (
                <Chip label="False Positive" size="small" color="default" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2">{vuln.description}</Typography>
              </Grid>

              {vuln.prompt_used && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PROBE PROMPT
                  </Typography>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1, p: 1.5, fontFamily: "monospace", fontSize: "0.8rem", maxHeight: 150, overflow: "auto" }}>
                    {vuln.prompt_used}
                  </Box>
                </Grid>
              )}

              {vuln.model_response && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    MODEL RESPONSE
                  </Typography>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1, p: 1.5, fontFamily: "monospace", fontSize: "0.8rem", maxHeight: 150, overflow: "auto" }}>
                    {vuln.model_response}
                  </Box>
                </Grid>
              )}

              {vuln.evidence && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    EVIDENCE
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {vuln.evidence}
                  </Typography>
                </Grid>
              )}

              {vuln.mitigation && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ bgcolor: "rgba(99,102,241,0.08)", borderRadius: 1, p: 1.5, borderLeft: "3px solid #6366f1" }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>
                      MITIGATION
                    </Typography>
                    <Typography variant="body2">{vuln.mitigation}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={vuln.is_false_positive}
                      onChange={(e) =>
                        fpMutation.mutate({ id: vuln.id, value: e.target.checked })
                      }
                      size="small"
                    />
                  }
                  label="Mark as false positive"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
