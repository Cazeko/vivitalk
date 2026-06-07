"use client";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-900/20 to-transparent" />
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
          오늘 가입하고,
          <br />
          <span className="gradient-text">내일부터 Vivitalk과 대화</span>
        </h2>
        <p className="mt-5 text-lg text-ink-50/70">신용카드 없이 무료로 시작. 언제든 해지할 수 있습니다.</p>
        <Link href="/signup" className="mt-10 inline-block px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold shadow-2xl shadow-brand-900/40 transition-all duration-200 hover:scale-[1.06] hover:brightness-110 hover:shadow-[0_30px_80px_-14px_rgba(124,58,237,0.75)] active:scale-[0.97]">
          무료로 시작하기 →
        </Link>
      </div>
    </section>
  );
}
