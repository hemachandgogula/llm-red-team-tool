import {
  Assessment,
  BugReport,
  Dashboard,
  Logout,
  Memory,
  Science,
  Storage,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <Dashboard />, path: "/" },
  { label: "Projects", icon: <Storage />, path: "/projects" },
  { label: "Model Configs", icon: <Memory />, path: "/model-configs" },
  { label: "Interactive Test", icon: <Science />, path: "/interactive-test" },
  { label: "Vulnerabilities", icon: <BugReport />, path: "/vulnerabilities" },
  { label: "Reports", icon: <Assessment />, path: "/reports" },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "background.paper" }}
        elevation={0}
      >
        <Toolbar>
          <BugReport sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            LLM Red Team Tool
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: "text.secondary" }}>
            {user?.email}
          </Typography>
          <Tooltip title="Logout">
            <IconButton onClick={logout} color="inherit">
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <Toolbar />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{ borderRadius: 1, mx: 1 }}
              >
                <ListItemIcon sx={{ color: "primary.main", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
