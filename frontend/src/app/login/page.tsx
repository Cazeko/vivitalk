"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, isLoading, clearError, hydrate, isAuthenticated, hydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && isAuthenticated) router.replace("/dashboard"); }, [hydrated, isAuthenticated, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch {}
  };

  return (
    <AuthShell
      title="로그인"
      subtitle="당신의 챗봇을 다시 만나보세요."
      alt={{ label: "아직 계정이 없으신가요?", href: "/signup", cta: "회원가입" }}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">이메일</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">비밀번호</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition"
            placeholder="••••••••"
          />
        </div>
        {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</div>}
        <button
          type="submit" disabled={isLoading}
          className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition disabled:opacity-50"
        >
          {isLoading ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </AuthShell>
  );
}
