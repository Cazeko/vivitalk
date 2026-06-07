"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Chatbot } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { OnboardingGuide } from "@/components/OnboardingGuide";

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.listChatbots().then((b) => {
      if (alive) { setBots(b); setLoading(false); }
    }).catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const totalDocs = bots.reduce((s, b) => s + (b.document_count || 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {user?.first_name || user?.email?.split("@")[0]} 님</h1>
          <p className="mt-2 text-ink-50/70">Vivitalk 콘솔에 오신 것을 환영합니다.</p>
        </div>
        <Link href="/dashboard/chatbots" className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition">
          + 새 챗봇 만들기
        </Link>
      </div>

      <OnboardingGuide bots={bots} loading={loading} />

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="text-sm text-ink-50/60">활성 챗봇</div>
          <div className="mt-2 text-3xl font-bold">{bots.filter((b) => b.status === "active").length}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm text-ink-50/60">총 문서</div>
          <div className="mt-2 text-3xl font-bold">{totalDocs}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-sm text-ink-50/60">상태</div>
          <div className="mt-2 text-3xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />정상
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold">최근 챗봇</h2>
        <div className="mt-4 space-y-3">
          {loading && <div className="text-ink-50/60 text-sm">로딩 중…</div>}
          {!loading && bots.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-ink-50/70">아직 챗봇이 없습니다.</p>
              <Link href="/dashboard/chatbots" className="mt-4 inline-block px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition">
                첫 챗봇 만들기 →
              </Link>
            </div>
          )}
          {bots.slice(0, 5).map((b) => (
            <Link key={b.id} href={`/dashboard/chatbots/${b.id}`} className="block glass rounded-2xl p-5 hover:bg-white/5 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-sm text-ink-50/60 mt-0.5">{b.description || "—"}</div>
                </div>
                <div className="text-right text-xs text-ink-50/50">
                  <div>{formatDate(b.created_at || undefined)}</div>
                  <div className="mt-1">문서 {b.document_count}개</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
