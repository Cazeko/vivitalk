"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const TIERS = [
  {
    name: "Starter",
    price: "₩0",
    period: "/ 월",
    bullets: ["챗봇 1개", "메시지 100건 / 월", "표준 위젯", "이메일 지원"],
    cta: "무료로 시작",
    popular: false,
  },
  {
    name: "Pro",
    price: "₩49,000",
    period: "/ 월",
    bullets: ["챗봇 5개", "메시지 5,000건 / 월", "위젯 커스터마이징", "우선 지원"],
    cta: "Pro 시작",
    popular: true,
  },
  {
    name: "Business",
    price: "₩199,000",
    period: "/ 월",
    bullets: ["무제한 챗봇", "메시지 50,000건 / 월", "전담 매니저", "SLA 99.9%"],
    cta: "문의하기",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-ink-50/80 font-mono uppercase tracking-[0.18em]">
            Pricing · 03
          </div>
          <h2 className="mt-5 font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            규모와 함께
            <br />
            <span className="font-light text-ink-50/80">
              커지는 가격.
            </span>
          </h2>
          <p className="mt-6 text-ink-50/70 text-base md:text-lg">
            언제든 업그레이드/다운그레이드,
            <span className="text-ink-50/40"> 환불도 가능합니다.</span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-7 glass overflow-hidden ${t.popular ? "ring-2 ring-brand-500/60" : ""}`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold">
                  가장 인기
                </div>
              )}
              <h3 className="text-2xl font-bold">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="text-ink-50/60">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-ink-50/85">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 mt-0.5 flex-none">
                      <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-7 block text-center px-5 py-3 rounded-2xl font-semibold transition ${
                  t.popular
                    ? "bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95 shadow-xl shadow-brand-900/40"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                {t.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
