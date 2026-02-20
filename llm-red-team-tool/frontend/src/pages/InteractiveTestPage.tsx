import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from "@mui/material";
import { ExpandMore, Send, Science } from "@mui/icons-material";
import { modelConfigsApi } from "@/api/modelConfigs";
import { testRunsApi } from "@/api/testRuns";
import type { InteractiveTestResult } from "@/types";
import { ALL_TEST_TYPES } from "@/types";
import SeverityBadge from "@/components/SeverityBadge";
import { formatConfidence, VULNERABILITY_TYPE_LABELS } from "@/utils/formatters";

export default function InteractiveTestPage() {
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["prompt_injection", "jailbreaking"]);
  const [result, setResult] = useState<InteractiveTestResult | null>(null);

  const { data: modelConfigs = [] } = useQuery({
    queryKey: ["modelConfigs"],
    queryFn: modelConfigsApi.list,
  });

  const testMutation = useMutation({
    mutationFn: () =>
      testRunsApi.interactiveTest({
        model_config_id: selectedModel,
        prompt,
        test_types: selectedTypes,
      }),
    onSuccess: (data) => setResult(data),
  });

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const riskColor = !result
    ? "text.primary"
    : result.risk_score >= 7
    ? "error.main"
    : result.risk_score >= 4
    ? "warning.main"
    : "success.main";

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Interactive Testing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Test a single prompt against your model and get instant vulnerability analysis
        </Typography>
      </Box>

      {modelConfigs.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No model configurations found. Add one on the Model Configs page first.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Configuration
          </Typography>

          <TextField
            select
            label="Model Configuration"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          >
            {modelConfigs.map((mc) => (
              <MenuItem key={mc.id} value={mc.id}>
                {mc.name} — {mc.provider}/{mc.model_id}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle2" gutterBottom>
            Vulnerability Checks
          </Typography>
          <FormGroup row>
            {ALL_TEST_TYPES.map((t) => (
              <FormControlLabel
                key={t.value}
                control={
                  <Checkbox
                    checked={selectedTypes.includes(t.value)}
                    onChange={() => toggleType(t.value)}
                    size="small"
                  />
                }
                label={t.label}
                sx={{ mr: 2 }}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Prompt
          </Typography>
          <TextField
            multiline
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            fullWidth
            placeholder="Enter the prompt you want to test…"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            size="large"
            startIcon={testMutation.isPending ? <CircularProgress size={16} /> : <Send />}
            onClick={() => testMutation.mutate()}
            disabled={!selectedModel || !prompt.trim() || selectedTypes.length === 0 || testMutation.isPending}
          >
            {testMutation.isPending ? "Testing…" : "Run Security Test"}
          </Button>
        </CardContent>
      </Card>

      {testMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Test failed. Please check your model configuration and try again.
        </Alert>
      )}

      {result && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Test Results
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Risk Score:
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color={riskColor}>
                    {result.risk_score.toFixed(1)} / 10
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                MODEL RESPONSE
              </Typography>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.04)",
                  borderRadius: 1,
                  p: 2,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {result.response}
              </Box>
            </CardContent>
          </Card>

          {result.vulnerabilities.length === 0 ? (
            <Alert severity="success" icon={<Science />}>
              No vulnerabilities detected for this prompt.
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Detected Vulnerabilities ({result.vulnerabilities.length})
              </Typography>
              {result.vulnerabilities.map((vuln, idx) => (
                <Accordion key={idx} defaultExpanded={idx === 0}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                      <SeverityBadge severity={vuln.severity} />
                      <Typography fontWeight={500}>{vuln.title}</Typography>
                      <Chip
                        label={VULNERABILITY_TYPE_LABELS[vuln.vulnerability_type] ?? vuln.vulnerability_type}
                        size="small"
                        variant="outlined"
                        sx={{ ml: "auto" }}
                      />
                      <Chip
                        label={`${formatConfidence(vuln.confidence)} confidence`}
                        size="small"
                        color="default"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {vuln.description}
                    </Typography>
                    {vuln.evidence && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          EVIDENCE
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {vuln.evidence}
                        </Typography>
                      </Box>
                    )}
                    {vuln.mitigation && (
                      <Box sx={{ mt: 1, bgcolor: "rgba(99,102,241,0.08)", borderRadius: 1, p: 1.5, borderLeft: "3px solid #6366f1" }}>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                          MITIGATION
                        </Typography>
                        <Typography variant="body2">{vuln.mitigation}</Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
