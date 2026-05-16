"use client";

const PLANS = [
  { name: "Starter", price: "₩0", current: true, bullets: ["챗봇 1개", "메시지 100건 / 월"] },
  { name: "Pro", price: "₩49,000", current: false, bullets: ["챗봇 5개", "메시지 5,000건 / 월"] },
  { name: "Business", price: "₩199,000", current: false, bullets: ["무제한 챗봇", "메시지 50,000건 / 월"] },
];

export default function BillingPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">결제 / 요금제</h1>
      <p className="mt-2 text-ink-50/70">현재 사용 중인 요금제를 관리합니다.</p>

      <div className="mt-7 grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <div key={p.name} className={`glass rounded-3xl p-6 relative ${p.current ? "ring-2 ring-brand-500/60" : ""}`}>
            {p.current && (
              <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500 font-semibold text-emerald-950">현재 요금제</div>
            )}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <div className="mt-2 text-3xl font-bold">{p.price}<span className="text-base text-ink-50/60 font-normal"> / 월</span></div>
            <ul className="mt-4 space-y-2 text-sm text-ink-50/80">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 mt-0.5 flex-none"><path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z"/></svg>
                  {b}
                </li>
              ))}
            </ul>
            <button disabled={p.current} className={`mt-5 w-full px-4 py-2.5 rounded-xl font-semibold transition ${p.current ? "bg-white/5 text-ink-50/50 cursor-default" : "bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95"}`}>
              {p.current ? "사용 중" : "업그레이드"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-ink-50/40">* 결제 시스템은 곧 출시됩니다 (PortOne 연동 예정).</p>
    </div>
  );
}
