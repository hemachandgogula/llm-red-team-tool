import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { Add, PlayArrow } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "@/api/projects";
import { modelConfigsApi } from "@/api/modelConfigs";
import { testRunsApi } from "@/api/testRuns";
import { ALL_TEST_TYPES } from "@/types";
import { formatDate, formatRiskScore, formatTestTypes } from "@/utils/formatters";
import SeverityBadge from "@/components/SeverityBadge";

const STATUS_COLORS: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  pending: "default",
  running: "primary",
  completed: "success",
  failed: "error",
};

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [runName, setRunName] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    ALL_TEST_TYPES.map((t) => t.value)
  );

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId!),
    enabled: !!projectId,
  });

  const { data: testRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ["testRuns", projectId],
    queryFn: () => testRunsApi.list(projectId!),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const runs = query.state.data ?? [];
      const hasRunning = runs.some((r) => r.status === "running" || r.status === "pending");
      return hasRunning ? 3000 : false;
    },
  });

  const { data: modelConfigs = [] } = useQuery({
    queryKey: ["modelConfigs"],
    queryFn: modelConfigsApi.list,
  });

  const createRunMutation = useMutation({
    mutationFn: () =>
      testRunsApi.create(projectId!, {
        name: runName,
        model_config_id: selectedModel,
        test_types: selectedTypes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testRuns", projectId] });
      setOpen(false);
      setRunName("");
    },
  });

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  if (projectLoading) return <LinearProgress />;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          {project.name}
        </Typography>
        {project.description && (
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            {project.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Test Runs ({testRuns.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          disabled={modelConfigs.length === 0}
        >
          New Test Run
        </Button>
      </Box>

      {modelConfigs.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to add a model configuration before running tests.{" "}
          <Button size="small" onClick={() => navigate("/model-configs")}>
            Add Model Config
          </Button>
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Test Types</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Vulnerabilities</TableCell>
                <TableCell>Created</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {runsLoading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}
              {testRuns.length === 0 && !runsLoading && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No test runs yet. Start your first security scan.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {testRuns.map((run) => (
                <TableRow
                  key={run.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/projects/${projectId}/test-runs/${run.id}`)}
                >
                  <TableCell>
                    <Typography fontWeight={500}>{run.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={run.status}
                      color={STATUS_COLORS[run.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {formatTestTypes(run.test_types)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    {run.total_tests > 0 && (
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={(run.completed_tests / run.total_tests) * 100}
                          sx={{ mb: 0.5, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {run.completed_tests}/{run.total_tests}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {run.risk_score !== null ? (
                      <Typography
                        fontWeight={700}
                        color={
                          run.risk_score >= 7
                            ? "error.main"
                            : run.risk_score >= 4
                            ? "warning.main"
                            : "success.main"
                        }
                      >
                        {formatRiskScore(run.risk_score)} / 10
                      </Typography>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {run.vulnerabilities_found > 0 ? (
                      <SeverityBadge
                        severity={run.vulnerabilities_found > 5 ? "high" : run.vulnerabilities_found > 2 ? "medium" : "low"}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {run.status === "completed" ? "None found" : "—"}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(run.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <PlayArrow sx={{ color: "text.disabled" }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Test Run</DialogTitle>
        <DialogContent>
          <TextField
            label="Run Name"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1, mb: 2 }}
            required
          />

          <TextField
            select
            label="Model Configuration"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
            required
          >
            <option value="">Select a model…</option>
            {modelConfigs.map((mc) => (
              <option key={mc.id} value={mc.id}>
                {mc.name} ({mc.provider} / {mc.model_id})
              </option>
            ))}
          </TextField>

          <Typography variant="subtitle2" gutterBottom>
            Vulnerability Tests
          </Typography>
          <FormGroup>
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
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createRunMutation.mutate()}
            disabled={!runName.trim() || !selectedModel || selectedTypes.length === 0 || createRunMutation.isPending}
          >
            {createRunMutation.isPending ? "Starting…" : "Start Test Run"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
