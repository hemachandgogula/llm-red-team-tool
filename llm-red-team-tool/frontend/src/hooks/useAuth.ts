import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginPayload, type RegisterPayload } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user, token, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate("/");
    },
  });

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return {
    user,
    token,
    isAuthenticated: isAuthenticated(),
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
