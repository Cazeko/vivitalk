import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; company_name?: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hydrated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await api.login(email, password);
          const me = await api.me();
          set({ user: me, isAuthenticated: true, isLoading: false });
        } catch (e: any) {
          set({ error: e?.response?.data?.detail || e.message || "로그인 실패", isLoading: false });
          throw e;
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await api.signup(data);
          await api.login(data.email, data.password);
          const me = await api.me();
          set({ user: me, isAuthenticated: true, isLoading: false });
        } catch (e: any) {
          set({ error: e?.response?.data?.detail || e.message || "회원가입 실패", isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        try { await api.logout(); } catch {}
        set({ user: null, isAuthenticated: false });
      },

      refreshMe: async () => {
        try {
          const me = await api.me();
          set({ user: me, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      hydrate: async () => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("vivitalk.token");
        if (!token) {
          set({ hydrated: true });
          return;
        }
        api.setToken(token);
        try {
          const me = await api.me();
          set({ user: me, isAuthenticated: true, hydrated: true });
        } catch {
          api.setToken(null);
          set({ user: null, isAuthenticated: false, hydrated: true });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "vivitalk-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
