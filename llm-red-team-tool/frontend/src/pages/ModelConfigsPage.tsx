import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Add, Delete, Memory, Visibility, VisibilityOff } from "@mui/icons-material";
import { modelConfigsApi, type ModelConfigPayload } from "@/api/modelConfigs";
import { formatDate } from "@/utils/formatters";

const PROVIDERS = [
  { value: "openai", label: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { value: "anthropic", label: "Anthropic", models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"] },
  { value: "huggingface", label: "Hugging Face", models: [] },
  { value: "custom", label: "Custom OpenAI-compatible", models: [] },
];

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d97706",
  huggingface: "#f59e0b",
  custom: "#6366f1",
};

export default function ModelConfigsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState<ModelConfigPayload>({
    name: "",
    provider: "openai",
    model_id: "gpt-4o-mini",
    api_key: "",
    api_base_url: "",
    max_tokens: 1024,
    temperature: 0.7,
  });

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["modelConfigs"],
    queryFn: modelConfigsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => modelConfigsApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modelConfigs"] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modelConfigsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["modelConfigs"] }),
  });

  const resetForm = () => {
    setForm({ name: "", provider: "openai", model_id: "gpt-4o-mini", api_key: "", max_tokens: 1024, temperature: 0.7 });
  };

  const selectedProvider = PROVIDERS.find((p) => p.value === form.provider);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Model Configurations
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Configure the AI models you want to test
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Model
        </Button>
      </Box>

      {!isLoading && configs.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Memory sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No model configurations yet
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Add a model to start running security tests
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ mt: 2 }}>
              Add First Model
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {configs.map((config) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={config.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {config.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={config.provider}
                        size="small"
                        sx={{ bgcolor: PROVIDER_COLORS[config.provider] + "33", color: PROVIDER_COLORS[config.provider] }}
                      />
                      <Chip label={config.model_id} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Max tokens: {config.max_tokens ?? 1024} · Temp: {config.temperature ?? 0.7}
                    </Typography>
                    {config.api_base_url && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        URL: {config.api_base_url}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled">
                      Added {formatDate(config.created_at)}
                    </Typography>
                  </Box>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (confirm(`Delete "${config.name}"?`)) {
                          deleteMutation.mutate(config.id);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Model Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Configuration Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
              placeholder="e.g. GPT-4o Mini Production"
            />

            <TextField
              select
              label="Provider"
              value={form.provider}
              onChange={(e) => {
                const p = PROVIDERS.find((pr) => pr.value === e.target.value);
                setForm({ ...form, provider: e.target.value, model_id: p?.models[0] ?? "" });
              }}
              fullWidth
            >
              {PROVIDERS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>

            {selectedProvider && selectedProvider.models.length > 0 ? (
              <TextField
                select
                label="Model"
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
                fullWidth
              >
                {selectedProvider.models.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Model ID"
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
                fullWidth
                required
                placeholder="e.g. mistralai/Mistral-7B-v0.1"
              />
            )}

            <TextField
              label="API Key"
              type={showKey ? "text" : "password"}
              value={form.api_key ?? ""}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              fullWidth
              placeholder="sk-..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {(form.provider === "huggingface" || form.provider === "custom") && (
              <TextField
                label="API Base URL"
                value={form.api_base_url ?? ""}
                onChange={(e) => setForm({ ...form, api_base_url: e.target.value })}
                fullWidth
                placeholder="https://api-inference.huggingface.co"
              />
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Max Tokens"
                type="number"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Temperature"
                type="number"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
                fullWidth
                inputProps={{ step: 0.1, min: 0, max: 2 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!form.name || !form.model_id || createMutation.isPending}
          >
            {createMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
