// Single source of truth for dashboard billing plans.
// Used by /dashboard/billing (plan grid) and /dashboard/billing/checkout (order summary).
// Prices are KRW, VAT(부가세 10%) 별도 — VAT is added at checkout.

export type PlanId = "starter" | "pro" | "business";

export interface BillingPlan {
  id: PlanId;
  name: string;
  /** 월 공급가액 (VAT 별도, KRW). Starter = 0 */
  priceMonthly: number;
  tagline: string;
  bullets: string[];
  /** 시각적으로 강조되는 추천 플랜 */
  highlight?: boolean;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    tagline: "처음 시작하는 팀을 위한 무료 플랜",
    bullets: ["챗봇 1개", "메시지 100건 / 월", "표준 위젯", "이메일 지원"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 49000,
    tagline: "성장하는 서비스를 위한 가장 인기 있는 선택",
    bullets: ["챗봇 5개", "메시지 5,000건 / 월", "위젯 커스터마이징", "우선 지원"],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 199000,
    tagline: "규모 있는 운영과 SLA가 필요한 팀을 위한 플랜",
    bullets: ["무제한 챗봇", "메시지 50,000건 / 월", "전담 매니저", "SLA 99.9%"],
  },
];

/** 현재 사용 중인 플랜. 실제 구독 상태는 추후 백엔드 연동으로 대체. */
export const CURRENT_PLAN_ID: PlanId = "starter";

export function getPlan(id: string | undefined | null): BillingPlan | undefined {
  return BILLING_PLANS.find((p) => p.id === id);
}

/** ₩1,234,000 형식 */
export function formatWon(amount: number): string {
  return "₩" + amount.toLocaleString("ko-KR");
}

export type BillingCycle = "monthly" | "annual";

export interface PriceBreakdown {
  /** 정가 공급가액 (연간은 12개월치) */
  listSupply: number;
  /** 연간 할인액 (2개월 무료). 월간은 0 */
  discount: number;
  /** 실제 청구 공급가액 (할인 반영) */
  supply: number;
  /** 부가세 10% */
  vat: number;
  /** 총 결제금액 (supply + vat) */
  total: number;
}

/** 연간 결제 시 2개월 무료 (= 10개월치 가격으로 12개월 이용) */
export function computePrice(priceMonthly: number, cycle: BillingCycle): PriceBreakdown {
  if (cycle === "annual") {
    const listSupply = priceMonthly * 12;
    const supply = priceMonthly * 10;
    const discount = listSupply - supply;
    const vat = Math.round(supply * 0.1);
    return { listSupply, discount, supply, vat, total: supply + vat };
  }
  const supply = priceMonthly;
  const vat = Math.round(supply * 0.1);
  return { listSupply: supply, discount: 0, supply, vat, total: supply + vat };
}

/** 다음 결제일 (오늘 기준 +1개월 / +1년) */
export function nextBillingDate(cycle: BillingCycle, from: Date = new Date()): string {
  const d = new Date(from);
  if (cycle === "annual") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
