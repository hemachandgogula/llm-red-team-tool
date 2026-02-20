import api from "./axios";
import type {
  InteractiveTestResult,
  TestRun,
  TestRunProgress,
  Vulnerability,
} from "@/types";

export const testRunsApi = {
  list: (projectId: string) =>
    api
      .get<TestRun[]>(`/projects/${projectId}/test-runs`)
      .then((r) => r.data),
  create: (
    projectId: string,
    data: { name: string; model_config_id: string; test_types: string[] }
  ) =>
    api
      .post<TestRun>(`/projects/${projectId}/test-runs`, data)
      .then((r) => r.data),
  get: (projectId: string, runId: string) =>
    api
      .get<TestRun>(`/projects/${projectId}/test-runs/${runId}`)
      .then((r) => r.data),
  getProgress: (projectId: string, runId: string) =>
    api
      .get<TestRunProgress>(
        `/projects/${projectId}/test-runs/${runId}/progress`
      )
      .then((r) => r.data),
  interactiveTest: (data: {
    model_config_id: string;
    prompt: string;
    test_types?: string[];
  }) =>
    api
      .post<InteractiveTestResult>("/projects/interactive-test", data)
      .then((r) => r.data),
};

export const vulnerabilitiesApi = {
  listForRun: (runId: string) =>
    api
      .get<Vulnerability[]>(`/vulnerabilities/test-runs/${runId}`)
      .then((r) => r.data),
  get: (id: string) =>
    api.get<Vulnerability>(`/vulnerabilities/${id}`).then((r) => r.data),
  update: (id: string, data: { is_false_positive?: boolean }) =>
    api
      .patch<Vulnerability>(`/vulnerabilities/${id}`, data)
      .then((r) => r.data),
};
