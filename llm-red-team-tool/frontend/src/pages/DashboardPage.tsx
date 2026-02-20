import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  BugReport,
  FolderOpen,
  Memory,
  Security,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "@/api/projects";
import { modelConfigsApi } from "@/api/modelConfigs";
import { useAuthStore } from "@/store/authStore";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}22`,
              color,
              display: "flex",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  info: "#10b981",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const { data: modelConfigs = [] } = useQuery({
    queryKey: ["modelConfigs"],
    queryFn: modelConfigsApi.list,
  });

  const recentProjects = projects.slice(0, 5);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.full_name?.split(" ")[0]} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage your LLM security testing campaigns
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Projects"
            value={projectsLoading ? "…" : projects.length}
            icon={<FolderOpen />}
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Model Configs"
            value={modelConfigs.length}
            icon={<Memory />}
            color="#10b981"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Vulnerability Types"
            value={7}
            icon={<BugReport />}
            color="#f43f5e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Security Tests"
            value="Ready"
            icon={<Security />}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Projects
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate("/projects")}
                >
                  New Project
                </Button>
              </Box>

              {projectsLoading && <LinearProgress />}

              {!projectsLoading && recentProjects.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No projects yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/projects")}
                  >
                    Create Your First Project
                  </Button>
                </Box>
              )}

              {recentProjects.map((p) => (
                <Box
                  key={p.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                    borderRadius: 1,
                    px: 1,
                  }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <Box>
                    <Typography fontWeight={500}>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.description || "No description"}
                    </Typography>
                  </Box>
                  <Chip label="View" size="small" color="primary" variant="outlined" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Vulnerability Coverage
              </Typography>
              {[
                "Prompt Injection",
                "Jailbreaking",
                "Data Poisoning",
                "Model Inversion",
                "Membership Inference",
                "Adversarial Examples",
                "Bias & Fairness",
              ].map((name, i) => {
                const colors = Object.values(SEVERITY_COLORS);
                const color = colors[i % colors.length];
                return (
                  <Box key={name} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2">{name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.08)",
                        "& .MuiLinearProgress-bar": { bgcolor: color },
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => navigate("/interactive-test")}
                  fullWidth
                >
                  Interactive Test
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Memory />}
                  onClick={() => navigate("/model-configs")}
                  fullWidth
                >
                  Add Model Config
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  onClick={() => navigate("/projects")}
                  fullWidth
                >
                  Manage Projects
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
