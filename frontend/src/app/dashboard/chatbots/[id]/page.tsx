"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Chatbot, DocumentInfo, ChatSource } from "@/lib/api";
import Link from "next/link";

type Tab = "sources" | "preview" | "settings" | "embed";

interface ChatTurn { role: "user" | "assistant"; content: string; sources?: ChatSource[]; }

export default function ChatbotDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [bot, setBot] = useState<Chatbot | null>(null);
  const [tab, setTab] = useState<Tab>("sources");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChatbot(id).then((b) => { setBot(b); setLoading(false); }).catch(() => router.replace("/dashboard/chatbots"));
  }, [id, router]);

  if (loading) return <div className="p-8 text-ink-50/60">로딩 중…</div>;
  if (!bot) return null;

  return (
    <div className="p-8 max-w-6xl">
      <Link href="/dashboard/chatbots" className="text-sm text-ink-50/60 hover:text-white">← 챗봇 목록</Link>
      <div className="mt-3 flex items-center gap-3">
        <span className="w-3 h-3 rounded-full" style={{ background: bot.primary_color }} />
        <h1 className="text-3xl font-bold tracking-tight">{bot.name}</h1>
      </div>
      <p className="mt-1 text-ink-50/60">{bot.description || "—"}</p>

      <div className="mt-7 flex flex-wrap gap-1 border-b border-white/10">
        {(["sources", "preview", "embed", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm transition border-b-2 ${tab === t ? "text-white border-brand-500" : "text-ink-50/60 hover:text-white border-transparent"}`}
          >
            {t === "sources" && "데이터"}
            {t === "preview" && "미리보기"}
            {t === "embed" && "임베드"}
            {t === "settings" && "설정"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "sources" && <SourcesTab chatbotId={bot.id} />}
        {tab === "preview" && <PreviewTab bot={bot} />}
        {tab === "embed" && <EmbedTab bot={bot} />}
        {tab === "settings" && <SettingsTab bot={bot} onSaved={(b) => setBot(b)} />}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
function SourcesTab({ chatbotId }: { chatbotId: string }) {
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setDocs(await api.listDocuments(chatbotId));
  };
  useEffect(() => { refresh(); const id = setInterval(refresh, 4000); return () => clearInterval(id); }, [chatbotId]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        await api.uploadDocument(chatbotId, f);
      }
      await refresh();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "업로드 실패");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("이 문서를 삭제하시겠습니까?")) return;
    await api.deleteDocument(chatbotId, id);
    refresh();
  };

  return (
    <div>
      <div
        className="glass rounded-3xl p-10 text-center cursor-pointer hover:bg-white/5 transition"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.html,application/pdf,text/plain,text/markdown,text/html"
          multiple
          onChange={(e) => upload(e.target.files)}
        />
        <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-brand-300"><path fill="currentColor" d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6h2v6h10v-6h2zM12 3l5 5h-3v6h-4V8H7l5-5z"/></svg>
        <div className="mt-3 font-semibold">{uploading ? "업로드 중…" : "여기로 드래그 하거나 클릭해서 업로드"}</div>
        <div className="mt-1 text-sm text-ink-50/60">PDF · TXT · Markdown · HTML (최대 20MB)</div>
      </div>

      <div className="mt-6 space-y-2">
        {docs.length === 0 && <div className="text-ink-50/60 text-sm">아직 업로드된 문서가 없습니다.</div>}
        {docs.map((d) => (
          <div key={d.id} className="glass rounded-2xl p-4 flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-white/5 grid place-items-center flex-none">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{d.name}</div>
              <div className="text-xs text-ink-50/50 mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded-full mr-2 ${
                  d.status === "processed" ? "bg-emerald-500/20 text-emerald-300" :
                  d.status === "processing" || d.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                  "bg-rose-500/20 text-rose-300"
                }`}>{d.status}</span>
                {d.status === "processed" && <>· 청크 {d.chunk_count}개</>}
                {d.status === "failed" && d.error_message && <>· {d.error_message}</>}
              </div>
            </div>
            <button onClick={() => onDelete(d.id)} className="text-ink-50/50 hover:text-rose-300 transition p-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4zm-2 6h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
function PreviewTab({ bot }: { bot: Chatbot }) {
  const [turns, setTurns] = useState<ChatTurn[]>([{ role: "assistant", content: bot.welcome_message }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, sending]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput("");
    const next: ChatTurn[] = [...turns, { role: "user", content: msg }];
    setTurns(next);
    setSending(true);
    try {
      const history = next.slice(-10).map((t) => ({ role: t.role, content: t.content }));
      const res = await api.chat(bot.id, msg, sessionId, history);
      setSessionId(res.session_id);
      setTurns([...next, { role: "assistant", content: res.response, sources: res.sources }]);
    } catch (e: any) {
      setTurns([...next, { role: "assistant", content: `오류: ${e?.response?.data?.detail || e.message}` }]);
    } finally { setSending(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass rounded-3xl p-5 lg:col-span-2 flex flex-col h-[640px]">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {turns.map((t, i) => (
            <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${t.role === "user" ? "text-white" : "bg-white/5 border border-white/10"}`}
                   style={t.role === "user" ? { background: bot.primary_color } : undefined}>
                <div style={{ whiteSpace: "pre-wrap" }}>{t.content}</div>
                {t.sources && t.sources.length > 0 && (
                  <div className="mt-2 text-[11px] text-ink-50/60">
                    근거: {t.sources.slice(0, 3).map((s) => s.document_name).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && <div className="text-xs text-ink-50/50">답변을 작성하는 중…</div>}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-brand-500/60"
          />
          <button onClick={send} disabled={sending || !input.trim()} className="px-5 py-3 rounded-xl font-semibold disabled:opacity-50" style={{ background: bot.primary_color }}>
            전송
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="glass rounded-2xl p-5">
          <div className="text-xs text-ink-50/50 uppercase tracking-wide">상태</div>
          <div className="mt-2 font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>활성</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 text-sm space-y-2 text-ink-50/70">
          <div className="font-semibold text-white">팁</div>
          <div>· 문서 업로드 후 처리가 끝나야 정확하게 답변합니다.</div>
          <div>· 자료에 없으면 솔직하게 모른다고 답합니다.</div>
          <div>· 답변에는 [#1] 형태로 출처를 인용합니다.</div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
function EmbedTab({ bot }: { bot: Chatbot }) {
  const code = bot.widget_code || "";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h3 className="font-semibold">웹사이트에 임베드</h3>
        <p className="text-sm text-ink-50/60 mt-1">아래 코드를 사이트의 <code>{`</body>`}</code> 직전에 붙여 넣으세요. 그게 끝입니다.</p>
        <div className="mt-4 relative">
          <pre className="bg-black/40 rounded-2xl p-5 text-sm text-emerald-300 overflow-x-auto font-mono">{code}</pre>
          <button onClick={copy} className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 transition">
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
      </div>
      <div className="glass rounded-3xl p-6">
        <h3 className="font-semibold">테스트 페이지</h3>
        <p className="text-sm text-ink-50/60 mt-1">새 탭에서 위젯을 바로 확인해 보세요.</p>
        <a href={`/widget-test/${bot.id}`} target="_blank" className="mt-4 inline-block px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm">
          테스트 페이지 열기 →
        </a>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
function SettingsTab({ bot, onSaved }: { bot: Chatbot; onSaved: (b: Chatbot) => void }) {
  const [form, setForm] = useState({
    name: bot.name,
    description: bot.description || "",
    welcome_message: bot.welcome_message,
    primary_color: bot.primary_color,
    status: bot.status,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.updateChatbot(bot.id, form as any);
      onSaved(updated);
      alert("저장되었습니다");
    } catch (e: any) {
      alert(e?.response?.data?.detail || "저장 실패");
    } finally { setSaving(false); }
  };

  return (
    <div className="glass rounded-3xl p-6 max-w-xl">
      <h3 className="font-semibold">기본 정보</h3>
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">이름</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">설명</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">환영 메시지</label>
          <textarea value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500/60 outline-none" />
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">테마 색상</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-14 h-10 rounded-lg bg-transparent border-0 cursor-pointer" />
            <input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none font-mono text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-50/60 mb-1.5">상태</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none">
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>
      <button onClick={save} disabled={saving} className="mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold hover:opacity-95 transition disabled:opacity-50">
        {saving ? "저장 중…" : "변경 사항 저장"}
      </button>
    </div>
  );
}
