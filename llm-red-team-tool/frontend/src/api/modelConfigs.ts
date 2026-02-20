import api from "./axios";
import type { ModelConfig } from "@/types";

export interface ModelConfigPayload {
  name: string;
  provider: string;
  model_id: string;
  api_key?: string;
  api_base_url?: string;
  max_tokens?: number;
  temperature?: number;
}

export const modelConfigsApi = {
  list: () => api.get<ModelConfig[]>("/model-configs").then((r) => r.data),
  create: (data: ModelConfigPayload) =>
    api.post<ModelConfig>("/model-configs", data).then((r) => r.data),
  get: (id: string) =>
    api.get<ModelConfig>(`/model-configs/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<ModelConfigPayload>) =>
    api.put<ModelConfig>(`/model-configs/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/model-configs/${id}`),
};
