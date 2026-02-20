import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ModelConfigsPage from "@/pages/ModelConfigsPage";
import InteractiveTestPage from "@/pages/InteractiveTestPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import TestResultsPage from "@/pages/TestResultsPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route
              path="/projects/:projectId/test-runs/:runId"
              element={<TestResultsPage />}
            />
            <Route path="/model-configs" element={<ModelConfigsPage />} />
            <Route path="/interactive-test" element={<InteractiveTestPage />} />
            <Route path="/vulnerabilities" element={<Navigate to="/" replace />} />
            <Route path="/reports" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
