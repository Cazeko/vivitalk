"use client";
import { motion } from "framer-motion";

interface Case {
  id: string;
  industry: string;
  domain: string;
  question: string;
  answer: string;
  source: string;
}

const CASES: Case[] = [
  {
    id: "01",
    industry: "카페",
    domain: "myshop.com",
    question: "오늘 영업시간이 어떻게 되나요?",
    answer:
      "오늘은 오전 10시부터 밤 10시까지 영업합니다. 강남역 3번 출구에서 도보 5분이에요.",
    source: "매장 안내 FAQ",
  },
  {
    id: "02",
    industry: "패션",
    domain: "atelier.kr",
    question: "Wave Tote 새 컬러 언제 출시되나요?",
    answer:
      "다음 주 월요일 오전 10시에 출시됩니다. 카키, 베이지 두 가지 색상으로 만나보실 수 있어요.",
    source: "AW26 신상품 일정",
  },
  {
    id: "03",
    industry: "영어 학원",
    domain: "ringo-edu.com",
    question: "수강료가 어떻게 되나요?",
    answer:
      "정규반은 월 35만원, 단과반은 18만원입니다. VIP반은 별도 상담을 통해 안내드려요.",
    source: "2026 수강료 안내",
  },
  {
    id: "04",
    industry: "치과",
    domain: "seoul-dental.kr",
    question: "이번 주 토요일 예약 가능해요?",
    answer:
      "토요일은 오전 10시 · 11시 · 오후 2시 · 4시 슬롯이 비어 있습니다. 검진은 30분 정도 소요됩니다.",
    source: "진료 시간표",
  },
  {
    id: "05",
    industry: "요가 스튜디오",
    domain: "loft-yoga.com",
    question: "처음인데 어떤 클래스가 좋을까요?",
    answer:
      "입문자는 'Slow Flow' 또는 '하타 베이직'부터 시작하시는 걸 추천드려요. 첫 수업은 무료 체험이 가능합니다.",
    source: "입문자 가이드",
  },
  {
    id: "06",
    industry: "부티크 호텔",
    domain: "maison-stay.kr",
    question: "조식이 포함된 객실이 있나요?",
    answer:
      "'Suite'와 'Garden Room' 두 타입이 조식 뷔페가 포함됩니다. 체크인 시 시간을 선택하실 수 있어요.",
    source: "객실 타입별 안내",
  },
];

const ACCENT = "#a855f7";       // brand fuchsia-500 — dot / hover bar / glow
const ACCENT_DEEP = "#7c3aed";  // brand-600 — stronger emphasis
const ACCENT_INK = "#5b21b6";   // brand-700 — readable text on white (WCAG AA 8.5:1)

export function CasePersonas() {
  return (
    <section id="cases" className="relative py-32 border-t border-white/5 overflow-hidden">
      {/* Subtle aurora glow on dark bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header — pndn-style two-line: bold + light weight contrast */}
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-ink-50/80 mb-6 font-mono uppercase tracking-[0.18em]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
            />
            <span>Use Cases · 06</span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            어떤 업종이든,
            <br />
            <span className="font-light text-ink-50/80">
              실제로 이렇게 답합니다.
            </span>
          </h2>
          <p className="mt-6 text-ink-50/65 text-base md:text-lg max-w-2xl leading-relaxed">
            업로드한 자료에서 근거를 찾아 인용까지 표기.
            <span className="text-ink-50/40"> 짐작도, 광고문구도 없습니다.</span>
          </p>
        </div>

        {/* Cards grid: 1 col mobile · 2 cols tablet · 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CASES.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 0.61, 0.36, 1] }}
              whileHover={{ y: -10, scale: 1.015 }}
              className="group relative bg-white rounded-3xl p-7 md:p-8 text-ink-900 shadow-2xl shadow-black/40 transition-shadow duration-300 ease-out cursor-pointer hover:shadow-[0_50px_90px_-20px_rgba(124,58,237,0.55),0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              {/* Accent outline — traces the card's full rounded border on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                style={{
                  padding: "1.5px",
                  background: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT}, ${ACCENT_DEEP})`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              {/* Soft radial glow on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(120% 60% at 50% 0%, rgba(168,85,247,0.08), transparent 70%)",
                }}
              />

              {/* Meta line — monospace, subtle */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-500 mb-6">
                <span className="text-zinc-600 font-semibold">CASE {c.id}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-800 font-bold">{c.industry}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-400 normal-case tracking-normal">
                  {c.domain}
                </span>
              </div>

              {/* Question — large bold pull-quote with accent left border on hover */}
              <div
                className="relative pl-4 border-l-2 border-zinc-200 group-hover:border-[#7c3aed] transition-colors duration-300 mb-5"
              >
                <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-400 mb-1.5 font-mono font-semibold">
                  Q.
                </div>
                <div className="text-lg md:text-xl font-bold tracking-tight leading-snug text-zinc-900">
                  {c.question}
                </div>
              </div>

              {/* Answer — comfortable body */}
              <div className="text-[14.5px] md:text-[15px] leading-[1.7] text-zinc-700 mb-7">
                {c.answer}
              </div>

              {/* Source — purple accent block, monospace tag */}
              <div className="flex items-center gap-2.5 pt-5 border-t border-zinc-100">
                <span
                  className="inline-block w-2 h-2 rounded-sm transition-transform duration-300 group-hover:scale-125"
                  style={{
                    background: ACCENT_DEEP,
                    boxShadow: `0 0 0 3px ${ACCENT}22`,
                  }}
                  aria-hidden
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: ACCENT_INK }}
                >
                  {c.source}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footer note — monospace, subtle */}
        <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-mono text-ink-50/45 tracking-wider">
          <span>$ npx vivitalk init --industry &lt;your-business&gt;</span>
          <span className="text-ink-50/25">—</span>
          <span style={{ color: ACCENT }}>같은 5분으로 당신 업종의 챗봇도 만들 수 있습니다.</span>
        </div>
      </div>
    </section>
  );
}
