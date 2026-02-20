import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: "auth-store" }
  )
);
