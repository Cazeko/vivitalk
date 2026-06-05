"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 overflow-hidden aurora-bg">
      <div className="absolute inset-0 -z-0">
        <HeroScene dual />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-ink-50/80"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>실시간 RAG · 멀티테넌시 · 코드 한 줄 임베드</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight [text-shadow:0_4px_28px_rgba(11,11,16,0.95),0_0_60px_rgba(11,11,16,0.5)]"
        >
          <span className="block">당신의 데이터로 만드는</span>
          <span className="gradient-text block [text-shadow:0_2px_20px_rgba(124,58,237,0.55)]">AI 챗봇, 5분이면 충분</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-ink-50/80 max-w-2xl mx-auto [text-shadow:0_2px_16px_rgba(11,11,16,0.85)]"
        >
          PDF 한 번만 올리면 끝. <strong className="text-white">Vivitalk</strong>이 학습하고, <code className="text-brand-300">{`<script>`}</code> 한 줄로 어떤 웹사이트에서든 답합니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/signup"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95 transition shadow-2xl shadow-brand-900/40 font-semibold"
          >
            무료로 시작하기 →
          </Link>
          <a
            href="#how"
            className="px-7 py-3.5 rounded-2xl border border-white/15 hover:bg-white/5 transition font-semibold"
          >
            동작 원리 보기
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-ink-50/60"
        >
          <div><div className="text-3xl font-bold text-white">5분</div>설치 시간</div>
          <div><div className="text-3xl font-bold text-white">99.9%</div>가용성</div>
          <div><div className="text-3xl font-bold text-white">{"<2s"}</div>응답 속도</div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink-900" />
    </section>
  );
}
