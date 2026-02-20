import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6366f1" },
    secondary: { main: "#f43f5e" },
    background: { default: "#0f172a", paper: "#1e293b" },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    success: { main: "#10b981" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

export default theme;
