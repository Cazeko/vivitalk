"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Chatbot } from "@/lib/api";
import { dismissOnboarding, hasEmbedded, isOnboardingDismissed } from "@/lib/onboarding";

interface Step {
  key: string;
  label: string;
  desc: string;
  cta: string;
  href: string;
  done: boolean;
  locked: boolean;
}

export function OnboardingGuide({ bots, loading }: { bots: Chatbot[]; loading: boolean }) {
  // localStorage는 클라이언트에서만 읽으므로 mount 이후에 반영 (hydration 안전)
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setDismissed(isOnboardingDismissed());
    setEmbedded(hasEmbedded());
    setReady(true);
  }, []);

  const hasBot = bots.length > 0;
  const hasDoc = bots.some((b) => (b.document_count || 0) > 0);
  const firstBot = bots[0];

  const steps: Step[] = [
    {
      key: "create",
      label: "첫 챗봇 만들기",
      desc: "이름과 색상만 정하면 30초면 충분해요.",
      cta: "챗봇 만들기",
      href: "/dashboard/chatbots#new",
      done: hasBot,
      locked: false,
    },
    {
      key: "upload",
      label: "학습 데이터 올리기",
      desc: "PDF·FAQ를 올리면 챗봇이 그 내용으로 답합니다.",
      cta: "문서 업로드",
      href: firstBot ? `/dashboard/chatbots/${firstBot.id}#sources` : "/dashboard/chatbots#new",
      done: hasDoc,
      locked: !hasBot,
    },
    {
      key: "embed",
      label: "웹사이트에 연결하기",
      desc: "임베드 코드 한 줄이면 어디에든 붙일 수 있어요.",
      cta: "임베드 코드 받기",
      href: firstBot ? `/dashboard/chatbots/${firstBot.id}#embed` : "/dashboard/chatbots#new",
      // 챗봇이 없으면 완료로 인정하지 않음 (예: 모든 챗봇 삭제 후 embedded 플래그만 남는 경우 단계 순서 어긋남 방지)
      done: embedded && hasBot,
      locked: !hasBot,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  const visible = ready && !loading && !dismissed;

  const dismiss = () => {
    dismissOnboarding();
    setDismissed(true);
  };

  // 완료 상태는 1회만 보여주고 잠시 후 자동으로 닫는다 (#3)
  useEffect(() => {
    if (!visible || !allDone) return;
    const t = setTimeout(() => {
      dismissOnboarding();
      setDismissed(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [visible, allDone]);

  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="시작 가이드"
      className="mt-8 glass rounded-3xl p-6 ring-1 ring-brand-500/20 relative"
    >
      {/* 장식 글로우 — 카드 모서리에만 클리핑하고, 콘텐츠의 focus-visible 아웃라인은 자르지 않도록 별도 레이어로 분리 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-600/20 blur-3xl" />
      </div>

      {allDone ? (
        <div className="relative text-center py-2">
          <span className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 grid place-items-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-400" aria-hidden="true">
              <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-bold">설정을 모두 마쳤어요</h2>
          <p className="mt-1.5 text-ink-50/65 text-sm">이제 위젯이 방문자의 질문에 자동으로 답합니다. 멋진 시작이에요.</p>
          <button
            onClick={dismiss}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            가이드 닫기
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.15em] text-ink-50/70">
                Getting Started
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight">5분이면 첫 챗봇이 완성돼요</h2>
              <p className="mt-1 text-sm text-ink-50/65">아래 단계만 따라오시면 바로 시작할 수 있어요.</p>
            </div>
            <button
              onClick={dismiss}
              aria-label="가이드 닫기"
              className="flex-none p-2 -mr-1 -mt-1 text-ink-50/40 hover:text-white transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path fill="currentColor" d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
              </svg>
            </button>
          </div>

          {/* 진행률 */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-600"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-ink-50/60 font-medium tabular-nums">
              {completed}/{total} 완료
            </span>
          </div>

          {/* 단계 */}
          <ol className="mt-5 space-y-2.5">
            {steps.map((s, i) => (
              <li
                key={s.key}
                className={`flex items-center gap-4 rounded-2xl p-4 border transition ${
                  s.done
                    ? "border-white/5 bg-white/[0.02]"
                    : s.locked
                    ? "border-white/5 bg-white/[0.02] opacity-60"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <StepBadge index={i + 1} done={s.done} locked={s.locked} />
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold ${s.done ? "text-ink-50/55 line-through decoration-ink-50/30" : ""}`}>
                    {s.label}
                  </div>
                  <div className="text-sm text-ink-50/55 mt-0.5">{s.desc}</div>
                </div>
                {s.done ? (
                  <span className="flex-none text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                      <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                    </svg>
                    완료
                  </span>
                ) : s.locked ? (
                  <span className="flex-none text-xs text-ink-50/40">이전 단계 먼저</span>
                ) : (
                  <Link
                    href={s.href}
                    className="flex-none px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95 transition whitespace-nowrap"
                  >
                    {s.cta} →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </motion.section>
  );
}

function StepBadge({ index, done, locked }: { index: number; done: boolean; locked: boolean }) {
  if (done)
    return (
      <span className="flex-none w-8 h-8 rounded-full bg-emerald-500/15 grid place-items-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400" aria-hidden="true">
          <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
        </svg>
      </span>
    );
  if (locked)
    return (
      <span className="flex-none w-8 h-8 rounded-full bg-white/5 grid place-items-center text-ink-50/40">
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
          <path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 8H9V6a3 3 0 0 1 6 0v3z" />
        </svg>
      </span>
    );
  return (
    <span className="flex-none w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-fuchsia-600 grid place-items-center text-sm font-bold">
      {index}
    </span>
  );
}
