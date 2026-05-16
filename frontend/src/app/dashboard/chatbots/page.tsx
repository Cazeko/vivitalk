"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Chatbot } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ChatbotsListPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", welcome_message: "안녕하세요! 무엇을 도와드릴까요?", primary_color: "#7c3aed" });

  const refresh = async () => {
    setLoading(true);
    try { setBots(await api.listChatbots()); } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createChatbot(form);
      setShowModal(false);
      setForm({ name: "", description: "", welcome_message: "안녕하세요! 무엇을 도와드릴까요?", primary_color: "#7c3aed" });
      await refresh();
    } finally { setCreating(false); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 문서와 학습 데이터가 모두 사라집니다.")) return;
    await api.deleteChatbot(id);
    await refresh();
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">챗봇</h1>
          <p className="mt-2 text-ink-50/70">학습된 데이터로 답하는 AI 챗봇을 관리합니다.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition">
          + 새 챗봇 만들기
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading && <div className="text-ink-50/60">로딩 중…</div>}
        {!loading && bots.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-ink-50/70">아직 챗봇이 없습니다.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition">
              첫 챗봇 만들기 →
            </button>
          </div>
        )}
        {bots.map((b) => (
          <div key={b.id} className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
            <Link href={`/dashboard/chatbots/${b.id}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.primary_color || "#7c3aed" }} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{b.name}</div>
                  <div className="text-sm text-ink-50/60 truncate">{b.description || "—"}</div>
                </div>
              </div>
            </Link>
            <div className="text-right text-xs text-ink-50/50 hidden sm:block">
              <div>문서 {b.document_count}개</div>
              <div className="mt-1">{formatDate(b.created_at || undefined)}</div>
            </div>
            <button onClick={() => onDelete(b.id)} className="p-2 text-ink-50/50 hover:text-rose-300 transition" title="삭제">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4zm-2 6h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z"/></svg>
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="bg-ink-900 border border-white/10 rounded-3xl p-7 w-full max-w-md">
            <h2 className="text-2xl font-bold">새 챗봇</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs text-ink-50/60 mb-1.5">이름 *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" placeholder="예: 우리 제품 도우미" />
              </div>
              <div>
                <label className="block text-xs text-ink-50/60 mb-1.5">설명</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" placeholder="이 챗봇이 무엇을 도와주는지" />
              </div>
              <div>
                <label className="block text-xs text-ink-50/60 mb-1.5">환영 메시지</label>
                <input value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-ink-50/60 mb-1.5">테마 색상</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-14 h-10 rounded-lg bg-transparent border-0 cursor-pointer" />
                  <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none font-mono text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-7 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl hover:bg-white/5 transition">취소</button>
              <button type="submit" disabled={creating} className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition disabled:opacity-50">
                {creating ? "생성 중…" : "만들기"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
