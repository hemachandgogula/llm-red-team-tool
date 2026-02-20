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

export default function RegisterPage() {
  const { register, registerLoading, registerError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ full_name: fullName, email, password });
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
              Create Account
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Register to start testing your LLMs for security vulnerabilities
          </Typography>

          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Registration failed. Email may already be in use.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              inputProps={{ minLength: 8 }}
              helperText="At least 8 characters"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={registerLoading}
            >
              {registerLoading ? "Creating account…" : "Create Account"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
