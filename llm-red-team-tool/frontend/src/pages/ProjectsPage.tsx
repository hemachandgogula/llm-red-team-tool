import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
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
} from "@mui/material";
import { Add, Delete, OpenInNew, FolderOpen } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "@/api/projects";
import { formatDate } from "@/utils/formatters";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => projectsApi.create({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Organize your LLM security testing campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          New Project
        </Button>
      </Box>

      {isLoading && (
        <Typography color="text.secondary">Loading projects…</Typography>
      )}

      {!isLoading && projects.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <FolderOpen sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No projects yet
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Create a project to start organizing your LLM security tests
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ mt: 2 }}>
              Create First Project
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {project.description || "No description provided"}
                </Typography>
                <Chip
                  label={`Created ${formatDate(project.created_at)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<OpenInNew />}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Open
                </Button>
                <Tooltip title="Delete project">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm(`Delete "${project.name}"?`)) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1, mb: 2 }}
            required
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
