import api from "./axios";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<TokenResponse>("/auth/login", payload).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    api.post<TokenResponse>("/auth/register", payload).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
