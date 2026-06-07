"use client";
import Link from "next/link";
import { BILLING_PLANS, CURRENT_PLAN_ID, formatWon } from "@/lib/plans";

export default function BillingPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">결제 / 요금제</h1>
      <p className="mt-2 text-ink-50/70">현재 사용 중인 요금제를 관리합니다.</p>

      <div className="mt-7 grid md:grid-cols-3 gap-4">
        {BILLING_PLANS.map((p) => {
          const current = p.id === CURRENT_PLAN_ID;
          const free = p.priceMonthly === 0;
          return (
            <div
              key={p.id}
              className={`glass rounded-3xl p-6 relative flex flex-col ${current ? "ring-2 ring-brand-500/60" : ""}`}
            >
              {current && (
                <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500 font-semibold text-emerald-950">
                  현재 요금제
                </div>
              )}
              {p.highlight && !current && (
                <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[11px] bg-gradient-to-r from-brand-600 to-fuchsia-600 font-semibold">
                  추천
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold">
                {free ? "₩0" : formatWon(p.priceMonthly)}
                <span className="text-base text-ink-50/60 font-normal"> / 월</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-50/80">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 mt-0.5 flex-none" aria-hidden="true">
                      <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                {current ? (
                  <button
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl font-semibold bg-white/5 text-ink-50/50 cursor-default"
                  >
                    사용 중
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/billing/checkout/${p.id}`}
                    className="block text-center w-full px-4 py-2.5 rounded-xl font-semibold transition bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95"
                  >
                    업그레이드
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-ink-50/40">* 결제 시스템은 곧 출시됩니다 (PortOne 연동 예정).</p>
    </div>
  );
}
