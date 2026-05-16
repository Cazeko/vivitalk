"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { useAuthStore } from "@/stores/authStore";

export default function SignupPage() {
  const router = useRouter();
  const { signup, error, isLoading, clearError, hydrate, isAuthenticated, hydrated } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "", company_name: "", first_name: "", last_name: "" });

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && isAuthenticated) router.replace("/dashboard"); }, [hydrated, isAuthenticated, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signup(form);
      router.replace("/dashboard");
    } catch {}
  };

  return (
    <AuthShell
      title="회원가입"
      subtitle="신용카드 없이 무료로 시작합니다."
      alt={{ label: "이미 계정이 있으신가요?", href: "/login", cta: "로그인" }}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-50/60 mb-1.5">성</label>
            <input value={form.last_name} onChange={set("last_name")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition" />
          </div>
          <div>
            <label className="block text-xs text-ink-50/60 mb-1.5">이름</label>
            <input value={form.first_name} onChange={set("first_name")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">회사명</label>
          <input value={form.company_name} onChange={set("company_name")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition" placeholder="개인이면 비워두셔도 좋습니다" />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">이메일</label>
          <input type="email" required value={form.email} onChange={set("email")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition" placeholder="you@company.com" />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">비밀번호</label>
          <input type="password" required minLength={8} value={form.password} onChange={set("password")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none transition" placeholder="8자 이상" />
        </div>
        {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</div>}
        <button type="submit" disabled={isLoading} className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition disabled:opacity-50">
          {isLoading ? "가입 중…" : "가입하고 시작하기"}
        </button>
      </form>
    </AuthShell>
  );
}
