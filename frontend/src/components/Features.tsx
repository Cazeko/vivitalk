"use client";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "5분 만에 학습",
    desc: "PDF, 매뉴얼, 웹페이지를 업로드하면 자동으로 임베딩하고 인덱싱합니다.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M12 3l9 4.9V17l-9 4.9L3 17V7.9zM12 5.3L5 9v6.4l7 3.8 7-3.8V9z"/></svg>
    ),
    color: "from-brand-500 to-fuchsia-500",
  },
  {
    title: "Hybrid RAG",
    desc: "Dense vector + BM25 융합 검색으로 정확도와 재현율 모두 확보.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm10 18l-6-6"/></svg>
    ),
    color: "from-sky-500 to-brand-500",
  },
  {
    title: "환각 가드",
    desc: "근거가 부족하면 “모른다”고 답하고 출처 [#1] [#2]를 인용합니다.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M12 2l9 4v6c0 5-3.8 9.7-9 10-5.2-.3-9-5-9-10V6l9-4z"/></svg>
    ),
    color: "from-emerald-500 to-cyan-500",
  },
  {
    title: "코드 한 줄 임베드",
    desc: "<script> 태그 하나로 어떤 사이트에든 챗봇을 띄울 수 있습니다.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M8 6l-6 6 6 6 1.4-1.4L4.8 12l4.6-4.6zM16 6l6 6-6 6-1.4-1.4L19.2 12l-4.6-4.6z"/></svg>
    ),
    color: "from-fuchsia-500 to-rose-500",
  },
  {
    title: "멀티테넌시",
    desc: "Pinecone Namespace + Postgres RLS로 고객사 데이터를 완전 격리.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M3 4h18v4H3zM3 10h18v4H3zM3 16h18v4H3z"/></svg>
    ),
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "다국어",
    desc: "한국어, 영어, 일본어를 자동 감지해 사용자 언어로 답합니다.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1 0-16 8 8 0 0 1 0 16z"/></svg>
    ),
    color: "from-indigo-500 to-violet-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-50/70">기능</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">
            상용 챗봇이 갖춰야 할 모든 것
          </h2>
          <p className="mt-4 text-ink-50/70 max-w-2xl mx-auto">
            아키텍처 고민, 임베딩 파이프라인, 위젯 통합 — 신경 쓸 필요 없습니다. Vivitalk이 다 처리합니다.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-3xl p-7 glass overflow-hidden"
            >
              <div className={`absolute -right-10 -top-10 w-44 h-44 rounded-full bg-gradient-to-br ${f.color} opacity-15 blur-2xl group-hover:opacity-30 transition`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} shadow-lg shadow-brand-900/30 text-white`}>
                {f.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-ink-50/70 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
