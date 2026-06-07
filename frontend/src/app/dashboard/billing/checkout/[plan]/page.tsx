"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import {
  BillingCycle,
  computePrice,
  formatWon,
  getPlan,
  nextBillingDate,
} from "@/lib/plans";

type PayMethod = "card" | "kakao" | "toss" | "transfer";

const PAY_METHODS: { id: PayMethod; label: string; sub: string; accent: string }[] = [
  { id: "card", label: "신용 · 체크카드", sub: "국내외 모든 카드", accent: "#7c3aed" },
  { id: "kakao", label: "카카오페이", sub: "간편결제", accent: "#FEE500" },
  { id: "toss", label: "토스페이", sub: "간편결제", accent: "#3182F6" },
  { id: "transfer", label: "계좌이체", sub: "실시간 이체", accent: "#34d399" },
];

export default function CheckoutPage() {
  const params = useParams<{ plan: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const plan = getPlan(params?.plan);

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [method, setMethod] = useState<PayMethod>("card");

  // 카드 폼 (UI only)
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });
  // 청구 정보
  const [email, setEmail] = useState(user?.email ?? "");
  const [company, setCompany] = useState(user?.company_name ?? "");
  const [taxInvoice, setTaxInvoice] = useState(false);
  const [bizNo, setBizNo] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const price = useMemo(
    () => computePrice(plan?.priceMonthly ?? 0, cycle),
    [plan, cycle],
  );

  // 무료/존재하지 않는 플랜은 결제 대상이 아님
  if (!plan || plan.priceMonthly === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="glass rounded-3xl p-10 text-center">
          <h1 className="text-2xl font-bold">결제할 수 없는 플랜이에요</h1>
          <p className="mt-2 text-ink-50/60">요금제 페이지에서 Pro 또는 Business 플랜을 선택해 주세요.</p>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm"
          >
            ← 요금제로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const cardBrand = detectBrand(card.number);
  const canPay =
    agreed &&
    !submitting &&
    (method !== "card" ||
      (digits(card.number).length >= 15 && card.expiry.length === 5 && card.cvc.length >= 3 && card.holder.trim().length > 0));

  const pay = async () => {
    if (!canPay) return;
    setSubmitting(true);
    // 결제 API 미연동 — UX 흐름 데모용 모킹
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setDone(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* 상단 내비 + 스텝 */}
      <Link href="/dashboard/billing" className="text-sm text-ink-50/60 hover:text-white transition">
        ← 요금제로 돌아가기
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">{plan.name}</span> 플랜으로 업그레이드
          </h1>
          <p className="mt-1.5 text-ink-50/60">{plan.tagline}</p>
        </div>
        <Stepper />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_minmax(340px,380px)] gap-6 items-start">
        {/* ───────────────── 왼쪽: 결제 정보 입력 ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-5"
        >
          {/* 결제 주기 */}
          <Card>
            <SectionTitle index="01" title="결제 주기" />
            <div className="grid sm:grid-cols-2 gap-3">
              <CycleOption
                active={cycle === "monthly"}
                onClick={() => setCycle("monthly")}
                title="월간 결제"
                desc="매월 청구 · 언제든 해지"
                price={`${formatWon(plan.priceMonthly)} / 월`}
              />
              <CycleOption
                active={cycle === "annual"}
                onClick={() => setCycle("annual")}
                title="연간 결제"
                desc="연 1회 청구"
                price={`${formatWon(plan.priceMonthly * 10)} / 년`}
                badge="2개월 무료"
              />
            </div>
          </Card>

          {/* 결제 수단 */}
          <Card>
            <SectionTitle index="02" title="결제 수단" />
            <div className="grid grid-cols-2 gap-3">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`relative text-left rounded-2xl p-4 border transition ${
                    method === m.id
                      ? "border-brand-500/70 bg-brand-500/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-xl grid place-items-center flex-none"
                      style={{ background: `${m.accent}22`, color: m.accent }}
                    >
                      <MethodIcon id={m.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm truncate">{m.label}</span>
                      <span className="block text-xs text-ink-50/50 truncate">{m.sub}</span>
                    </span>
                  </span>
                  {method === m.id && (
                    <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-500 grid place-items-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" aria-hidden="true">
                        <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 카드 폼 (카드 선택 시) */}
            <AnimatePresence initial={false}>
              {method === "card" ? (
                <motion.div
                  key="card-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    <Field label="카드 번호">
                      <div className="relative">
                        <input
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                          placeholder="1234 1234 1234 1234"
                          className={inputCls + " font-mono tracking-wider pr-20"}
                        />
                        {cardBrand && (
                          <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[11px] font-semibold px-2 py-1 rounded-md bg-white/10 text-ink-50/80">
                            {cardBrand}
                          </span>
                        )}
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="유효기간">
                        <input
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                          placeholder="MM / YY"
                          className={inputCls + " font-mono"}
                        />
                      </Field>
                      <Field label="CVC">
                        <input
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={card.cvc}
                          onChange={(e) => setCard({ ...card, cvc: digits(e.target.value).slice(0, 3) })}
                          placeholder="•••"
                          className={inputCls + " font-mono"}
                        />
                      </Field>
                    </div>
                    <Field label="카드 소유자 이름">
                      <input
                        autoComplete="cc-name"
                        value={card.holder}
                        onChange={(e) => setCard({ ...card, holder: e.target.value })}
                        placeholder="HONG GILDONG"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="redirect-note"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-ink-50/60 flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-50/40 flex-none" aria-hidden="true">
                    <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  결제하기를 누르면 {PAY_METHODS.find((m) => m.id === method)?.label} 결제창으로 이동합니다.
                </motion.p>
              )}
            </AnimatePresence>
          </Card>

          {/* 청구 정보 */}
          <Card>
            <SectionTitle index="03" title="청구 정보" />
            <div className="space-y-4">
              <Field label="이메일 (영수증 수신)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputCls}
                />
              </Field>
              <Field label="회사명 (선택)">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="회사 또는 팀 이름"
                  className={inputCls}
                />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Check checked={taxInvoice} onChange={() => setTaxInvoice((v) => !v)} />
                <span className="text-sm text-ink-50/80">세금계산서 발행이 필요해요</span>
              </label>
              <AnimatePresence initial={false}>
                {taxInvoice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Field label="사업자 등록번호">
                      <input
                        inputMode="numeric"
                        value={bizNo}
                        onChange={(e) => setBizNo(formatBizNo(e.target.value))}
                        placeholder="000-00-00000"
                        className={inputCls + " font-mono"}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* ───────────────── 오른쪽: 주문 요약 (sticky) ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="lg:sticky lg:top-6"
        >
          <div className="glass rounded-3xl p-6 ring-1 ring-brand-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">주문 요약</h2>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-brand-600 to-fuchsia-600">
                {plan.name}
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-ink-50/80">
              {plan.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400 mt-0.5 flex-none" aria-hidden="true">
                    <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            <div className="my-5 border-t border-white/10" />

            <dl className="space-y-2.5 text-sm">
              <Row label={`플랜 금액 (${cycle === "annual" ? "연간" : "월간"})`} value={formatWon(price.listSupply)} />
              {price.discount > 0 && (
                <Row label="연간 할인 (2개월)" value={`−${formatWon(price.discount)}`} accent="text-emerald-400" />
              )}
              <Row label="부가세 (10%)" value={formatWon(price.vat)} muted />
            </dl>

            <div className="my-4 border-t border-white/10" />

            <div className="flex items-end justify-between">
              <span className="text-sm text-ink-50/70">총 결제금액</span>
              <span className="text-right">
                <span className="block text-2xl font-bold">{formatWon(price.total)}</span>
                <span className="block text-xs text-ink-50/50">/ {cycle === "annual" ? "년" : "월"}</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-50/50">
              다음 결제일: {nextBillingDate(cycle)}
            </p>

            <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
              <Check checked={agreed} onChange={() => setAgreed((v) => !v)} />
              <span className="text-xs text-ink-50/70 leading-relaxed">
                <span className="text-ink-50/90">자동 결제</span> 및{" "}
                <span className="underline decoration-white/30">환불 정책</span>에 동의합니다.
                결제일마다 자동으로 갱신되며 언제든 해지할 수 있어요.
              </span>
            </label>

            <button
              onClick={pay}
              disabled={!canPay}
              className="mt-5 w-full px-5 py-3.5 rounded-2xl font-semibold transition bg-gradient-to-r from-brand-600 to-fuchsia-600 shadow-xl shadow-brand-900/40 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Spinner /> 결제 처리 중…
                </>
              ) : (
                <>{formatWon(price.total)} 결제하기</>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-50/45">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true">
                <path fill="currentColor" d="M12 1l9 4v6c0 5.25-3.75 9.74-9 11-5.25-1.26-9-5.75-9-11V5l9-4zm0 2.18L5 6.3v4.7c0 4.07 2.83 7.74 7 8.93 4.17-1.19 7-4.86 7-8.93V6.3l-7-3.12z" />
              </svg>
              SSL 보안 결제 · 카드 정보는 서버에 저장되지 않습니다
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-ink-50/35">
            * 결제 API 연동 예정 — 현재는 UI 미리보기입니다
          </p>
        </motion.div>
      </div>

      {/* ───────────────── 결제 완료 오버레이 ───────────────── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-900/80 backdrop-blur-md p-6"
            role="dialog"
            aria-modal="true"
            aria-label="결제 완료"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="glass rounded-3xl p-8 max-w-sm w-full text-center ring-1 ring-emerald-400/30"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 grid place-items-center"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-400" aria-hidden="true">
                  <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
                </svg>
              </motion.span>
              <h2 className="mt-5 text-xl font-bold">결제가 완료되었어요</h2>
              <p className="mt-2 text-sm text-ink-50/70">
                <span className="font-semibold text-white">{plan.name}</span> 플랜이 활성화되었습니다.
                <br />
                {formatWon(price.total)} · {cycle === "annual" ? "연간" : "월간"} 결제
              </p>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full px-5 py-3 rounded-2xl font-semibold bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-95 transition"
                >
                  대시보드로 가기
                </button>
                <Link
                  href="/dashboard/billing"
                  className="block w-full px-5 py-3 rounded-2xl text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  요금제로 돌아가기
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-ink-50/40">
                * 데모 화면입니다 — 실제 결제는 이루어지지 않았습니다
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── building blocks ───────────────────────── */

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-brand-500/60 transition placeholder:text-ink-50/30";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-3xl p-6">{children}</div>;
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-mono text-brand-300/80 tracking-wider">{index}</span>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-50/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-ink-50/50" : "text-ink-50/70"}>{label}</dt>
      <dd className={accent || "text-ink-50/90"}>{value}</dd>
    </div>
  );
}

function CycleOption({
  active,
  onClick,
  title,
  desc,
  price,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  price: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative text-left rounded-2xl p-4 border transition ${
        active ? "border-brand-500/70 bg-brand-500/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-emerald-950">
          {badge}
        </span>
      )}
      <span className="flex items-center justify-between">
        <span className="font-semibold text-sm">{title}</span>
        <span
          className={`w-4 h-4 rounded-full border grid place-items-center ${
            active ? "border-brand-500 bg-brand-500" : "border-white/25"
          }`}
        >
          {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
      </span>
      <span className="block text-xs text-ink-50/50 mt-1">{desc}</span>
      <span className="block text-sm font-semibold mt-2">{price}</span>
    </button>
  );
}

function Check({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  // 실제 checkbox는 시각적으로 숨기고(sr-only) 접근성/키보드 포커스 유지, 비주얼은 span으로 그림.
  return (
    <span className="relative inline-grid place-items-center mt-0.5 flex-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`w-5 h-5 rounded-md border grid place-items-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 ${
          checked ? "bg-brand-600 border-brand-600" : "border-white/25 bg-white/5 peer-hover:border-white/40"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" aria-hidden="true">
            <path fill="currentColor" d="M9 16.2l-3.5-3.6-1.4 1.4L9 19l11-11-1.4-1.4z" />
          </svg>
        )}
      </span>
    </span>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

function Stepper() {
  const steps = ["플랜 선택", "결제 정보", "완료"];
  const activeIdx = 1;
  return (
    <ol className="hidden sm:flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold ${
              i < activeIdx
                ? "bg-emerald-500 text-emerald-950"
                : i === activeIdx
                ? "bg-gradient-to-r from-brand-600 to-fuchsia-600 text-white"
                : "bg-white/10 text-ink-50/50"
            }`}
          >
            {i < activeIdx ? "✓" : i + 1}
          </span>
          <span className={i === activeIdx ? "text-white font-medium" : "text-ink-50/45"}>{s}</span>
          {i < steps.length - 1 && <span className="w-5 h-px bg-white/15" />}
        </li>
      ))}
    </ol>
  );
}

function MethodIcon({ id }: { id: PayMethod }) {
  if (id === "card")
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 3v2h16V8H4zm0 5v4h7v-4H4z" />
      </svg>
    );
  if (id === "transfer")
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path fill="currentColor" d="M12 2l9 4v2H3V6l9-4zM4 10h3v7H4v-7zm6.5 0h3v7h-3v-7zM17 10h3v7h-3v-7zM3 19h18v2H3v-2z" />
      </svg>
    );
  // kakao / toss — 간편결제: 말풍선/번개 표현
  if (id === "kakao")
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.6 21l4-2.3c.8.1 1.6.2 2.4.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="currentColor" d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" />
    </svg>
  );
}

/* ───────────────────────── formatting helpers ───────────────────────── */

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

function formatCardNumber(s: string): string {
  return digits(s).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(s: string): string {
  const d = digits(s).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function formatBizNo(s: string): string {
  const d = digits(s).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function detectBrand(num: string): string | null {
  const d = digits(num);
  if (d.length < 2) return null;
  if (d.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "AMEX";
  if (/^35/.test(d)) return "JCB";
  if (/^62/.test(d)) return "UnionPay";
  return "CARD";
}
