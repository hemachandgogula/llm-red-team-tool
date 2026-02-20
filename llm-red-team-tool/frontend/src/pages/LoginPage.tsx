import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { BugReport } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, loginLoading, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
            <BugReport sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700}>
              LLM Red Team Tool
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to start security testing your AI models
          </Typography>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid email or password
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            No account?{" "}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
