"use client";
import { motion } from "framer-motion";

const STATEMENTS = [
  {
    problem: "일반 챗봇은 답을 지어냅니다",
    solution: "근거가 없으면 모른다고 답하고 출처를 인용합니다",
    metric: "환각률 0%",
    detail: "Hybrid RAG + BM25 리랭킹 + 유사도 임계값 가드",
    accent: "from-emerald-500/20 to-cyan-500/10",
    dot: "bg-emerald-400",
  },
  {
    problem: "PDF 하나 올리는 데 개발자가 필요합니다",
    solution: "드래그 앤 드롭 — 5분 안에 학습 완료",
    metric: "5분",
    detail: "자동 청킹 · 임베딩 · 인덱싱 파이프라인",
    accent: "from-brand-500/20 to-fuchsia-500/10",
    dot: "bg-brand-400",
  },
  {
    problem: "챗봇을 사이트에 붙이려면 며칠이 걸립니다",
    solution: "<script> 한 줄로 어떤 사이트에도 즉시 임베드",
    metric: "1줄",
    detail: "shadow-DOM 위젯 · data-chatbot-id 어트리뷰트",
    accent: "from-fuchsia-500/20 to-rose-500/10",
    dot: "bg-fuchsia-400",
  },
  {
    problem: "고객사 데이터가 섞일까 걱정됩니다",
    solution: "Pinecone Namespace + Postgres RLS로 완전 격리",
    metric: "100% 격리",
    detail: "네임스페이스 = client_{id}_chatbot_{id}",
    accent: "from-orange-500/20 to-amber-500/10",
    dot: "bg-orange-400",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-ink-50/80 font-mono uppercase tracking-[0.18em]">
            왜 Vivitalk인가
          </div>
          <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            실제로 쓸 수 있는
            <br />
            <span className="font-light text-ink-50/60">챗봇이 갖춰야 할 것들.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {STATEMENTS.map((s, i) => (
            <motion.div
              key={s.problem}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`relative rounded-3xl p-7 glass overflow-hidden bg-gradient-to-br ${s.accent}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-50/50 line-through leading-snug">{s.problem}</p>
                  <p className="mt-2 text-base font-semibold leading-snug">{s.solution}</p>
                  <p className="mt-3 text-xs text-ink-50/40 font-mono">{s.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 text-sm font-bold`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.metric}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
