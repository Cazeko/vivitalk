# Vivitalk Design System

> Single source of truth for all design decisions. Update this file whenever a design decision is made. Implementers reference this before coding UI.

---

## 1. Information Architecture

### Landing Page — Section Order & Roles

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                         │
│  Logo · Nav (Features / 요금제 / 동작원리) · CTA 버튼    │
└─────────────────────────────────────────────────────────┘
         │
         ▼  FIRST 5 SECONDS — visceral impression
┌─────────────────────────────────────────────────────────┐
│  HERO                                                    │
│  JOB: "이게 뭔지 + 왜 써야 하는지" 즉시 전달            │
│  Hierarchy: Brand → Headline → Sub → CTA → Social proof  │
│  Anchor: 3D 챗봇 데모 (오른쪽/배경)                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼  AFTER SCROLL — behavioral (5 minutes)
┌─────────────────────────────────────────────────────────┐
│  FEATURES                                                │
│  JOB: "기술적 차별점 설득" (Hybrid RAG, 환각가드 등)    │
│  NOT: 모든 기능 나열. 신뢰를 사는 3~4개 핵심만          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  HOW IT WORKS                                            │
│  JOB: "실제로 어떻게 쓰는지 보여줘" (4단계 프로세스)    │
│  구체적 시간(5분), 구체적 액션(드래그 앤 드롭)           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  CASE PERSONAS (선택)                                    │
│  JOB: "나한테도 맞는지" 확인 (고객 유형 매핑)            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  PRICING                                                 │
│  JOB: "가격이 합리적인가" 확인 및 결정 지원              │
│  Pro 티어를 시각적으로 강조 (ring 테두리)                │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  CTA (Bottom)                                            │
│  JOB: 마지막 설득 + 진입                                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  FOOTER                                                  │
│  JOB: 법적 링크, 보조 내비게이션                         │
└─────────────────────────────────────────────────────────┘
```

### User Eye-Flow — Hero (First Viewport)

```
[1] Brand/Logo (신뢰 확인)
[2] Headline — "당신의 데이터로 만드는 AI 챗봇, 5분이면 충분" (무엇인지)
[3] Sub-headline — 구체적 혜택 (어떻게)
[4] 3D 챗봇 데모 (증거)
[5] CTA 버튼 — "무료로 시작하기" (행동)
[6] Stats row — 5분/99.9%/<2s (불안 해소)
```

**Rule:** 이 순서가 바뀌면 전환율에 영향을 줌. 섹션 추가 시 이 IA 다이어그램 먼저 업데이트.

### Navigation Structure

```
랜딩 (/)
  ├── 회원가입 (/signup)
  │     └── 이메일 인증 완료 → 대시보드 (/dashboard)
  ├── 로그인 (/login)
  │     └── 성공 → 대시보드 (/dashboard)
  └── 대시보드 (/dashboard) [AuthGuard]
        ├── 챗봇 목록
        ├── 챗봇 생성/편집
        │     ├── 기본 설정 (이름, 색상, 환영 메시지)
        │     ├── 문서 업로드
        │     └── 위젯 미리보기 + 임베드 코드
        └── 계정 설정
```

---

## 2. Design Tokens

### Color

```css
/* Brand — Purple scale */
--brand-600: #7c3aed;   /* Primary CTA, focus rings */
--brand-500: #8b5cf6;   /* Hover state */
--brand-300: #c4b5fd;   /* Code, accent text */

/* Ink — Background/text */
--ink-900: #0b0b10;     /* Page background */
--ink-50:  #f7f7f8;     /* Body text */
--ink-50-80: rgba(247, 247, 248, 0.8);  /* Secondary text */
--ink-50-60: rgba(247, 247, 248, 0.6);  /* Muted text */
--ink-50-40: rgba(247, 247, 248, 0.4);  /* Disabled / placeholder */

/* Semantic */
--color-success: #34d399;  /* emerald-400 */
--color-error:   #f87171;  /* red-400 */
--color-warning: #fbbf24;  /* amber-400 */

/* Glass surfaces */
--glass-bg: rgba(255, 255, 255, 0.04);
--glass-border: rgba(255, 255, 255, 0.07);
```

### Typography

```
Display:  Pretendard → Inter → system-ui   (헤드라인, h1-h3)
Body:     Pretendard → -apple-system → ...  (본문, UI 텍스트)
Mono:     ui-monospace, SFMono, Menlo       (코드, 임베드 스니펫)

Scale:
  7xl: 4.5rem / bold / tracking-tight   → Hero headline (desktop)
  5xl: 3rem   / bold / tracking-tight   → Hero headline (mobile), section h2
  4xl: 2.25rem/ bold                    → Section h2 (mobile)
  xl:  1.25rem/ normal                  → Body large, sub-headline
  base:1rem   / normal                  → Body, card content
  sm:  0.875rem/ normal                 → Caption, metadata
  xs:  0.75rem / mono / tracking-wide   → Section labels (FEATURES · 06)

⚠️  Pretendard는 next/font 또는 CDN으로 반드시 로드해야 함.
    현재 tailwind.config에 정의만 되고 실제 로드 코드가 없음 → TODO #1
```

### Spacing Scale

```
Tailwind default scale 사용. 프로젝트 내 관용 패턴:
  Section padding: py-32 (8rem)
  Container:       max-w-7xl px-6
  Card padding:    p-7
  Card gap:        gap-5
  CTA button:      px-7 py-3.5
  Border radius:   rounded-3xl (카드), rounded-2xl (버튼/아이콘)
```

### Border Radius

```
rounded-3xl: 카드, 섹션 컨테이너 (24px)
rounded-2xl: 버튼, 아이콘 박스, 코드 블록 (16px)
rounded-full: 뱃지, 태그, 작은 닷 인디케이터
```

### Motion

```css
/* 페이지 진입 */
fade-up: opacity 0→1, translateY 20→0px, 0.5-0.8s ease, stagger 0.05-0.1s

/* 스크롤 진입 (whileInView) */
viewport: { once: true, margin: "-50px" }
transition: { duration: 0.5, delay: i * 0.05 }

/* Gradient text */
gradient-x: 12s ease infinite (background-position 0%→100%→0%)

/* 허용 모션 수: 최소 3개 (진입, 스크롤, hover) */
/* 모든 모션은 prefers-reduced-motion 존중 — TODO #2 */
```

---

## 3. Component States

### 3.1 Interaction State Table

| Feature | Loading | Empty | Error | Success | Partial |
|---------|---------|-------|-------|---------|---------|
| **챗봇 목록** | 스켈레톤 카드 3개 | "첫 챗봇을 만들어보세요" + 생성 CTA | "불러오기 실패" + 재시도 | 챗봇 카드 그리드 | — |
| **문서 업로드** | 진행 바 + % + "처리 중..." | "PDF를 드래그하거나 클릭해서 업로드" | "처리 실패: {error_message}" + 재시도 | "✓ 학습 완료 · {chunk_count}개 청크" | status=processing: 스피너 + "임베딩 중..." |
| **챗 위젯** | 타이핑 점 애니메이션 (3dot bounce) | 환영 메시지 + 입력 유도 | "답변을 찾지 못했어요. 다시 질문해주세요." | 챗버블 | RAG 임계값 미달: "모르겠습니다. 전문 상담사에게 문의해주세요." |
| **대시보드** | 각 섹션 스켈레톤 | 빈 상태 (아래 참고) | Toast 에러 | — | — |
| **로그인/회원가입** | 버튼 spinner + disabled | — | 인라인 필드 에러 메시지 | 리다이렉트 | — |

### 3.2 Empty States 규격

**챗봇 목록 빈 상태 (가장 중요):**
```
[아이콘: 챗봇 실루엣 또는 spark]
"아직 챗봇이 없어요"
"데이터를 업로드하고 5분 안에 첫 AI 챗봇을 만들어보세요."
[CTA: "챗봇 만들기 →"]
```
규칙: 빈 상태는 항상 (1) 따뜻한 멘트, (2) 행동 유도 CTA, (3) 컨텍스트 제공.
"No items found." 같은 단순 메시지는 금지.

**문서 없는 챗봇 상태:**
```
[업로드 아이콘]
"아직 학습 데이터가 없어요"
"PDF, 매뉴얼, FAQ를 올리면 챗봇이 그걸로 답합니다."
[CTA: "문서 업로드"]
```

---

## 4. User Journey & Emotional Arc

```
STEP | USER ACTION          | EMOTION TARGET      | UI가 지원하는 방법
-----|----------------------|---------------------|---------------------------
1    | 랜딩 첫 방문         | "오, 이게 뭐지?"    | Aurora bg + 3D 챗봇 데모
2    | 헤드라인 읽기        | "나한테 필요한 거네" | "5분이면 충분" + 구체적 수치
3    | 스크롤 시작          | "어떻게 작동하지?"  | HowItWorks 4단계 단순화
4    | Features 읽기        | "이건 제대로 만들었네"| Hybrid RAG, 환각가드 명시
5    | 가격 확인            | "부담 없네"         | 무료 티어 + 환불 보장 멘트
6    | 회원가입 클릭        | "해볼 만하다"       | 마찰 최소화 (이메일만)
7    | 첫 챗봇 만들기       | "생각보다 쉽네"     | 3단계 이내 첫 챗봇 완성
8    | 위젯 임베드          | "진짜 되네!"        | 즉각적인 챗봇 응답

5-second:  "무엇" 즉시 파악 → Headline + Sub-headline
5-minute:  "어떻게" 이해 → HowItWorks + Features
5-year:    "신뢰" 구축 → SLA 99.9%, 환각가드, 출처 인용
```

---

## 5. AI Slop Risk — 현재 위험 항목

Classifier: **HYBRID** (마케팅 랜딩 + SaaS 앱)

### Hard Rejection 체크

| # | 패턴 | 현재 상태 | 위험도 |
|---|------|-----------|--------|
| 1 | Generic SaaS card grid as first impression | Hero는 OK (3D 데모 있음) | 낮음 |
| 2 | Beautiful image with weak brand | aurora-bg 있으나 brand 로고 작음 | 중간 |
| 3 | Strong headline with no clear action | CTA 있음 | 낮음 |
| 4 | Busy imagery behind text | [text-shadow] 처리됨 | 낮음 |
| 5 | Sections repeating same mood | Features + HowItWorks 유사한 tone | **주의** |
| 6 | Carousel | 없음 | 낮음 |
| 7 | App UI stacked cards | 대시보드 미정의 | 미검증 |

### AI Slop Blacklist 체크

| # | 패턴 | 현재 상태 |
|---|------|-----------|
| 1 | Purple gradient backgrounds | **⚠️ 위험: aurora-bg가 purple/pink 그라디언트** — 의도적이고 구체적이면 OK, 기본값처럼 보이면 NG |
| 2 | 3-column feature grid | **⚠️ 위험: Features.tsx가 정확히 3-column icon+title+desc 패턴** |
| 3 | Icons in colored circles | **⚠️ 위험: 현재 아이콘이 colored gradient 박스 안** |
| 4 | Centered everything | **⚠️ 위험: Features 섹션 헤더 전부 text-center** |
| 5 | Uniform bubbly border-radius | rounded-3xl 일관 — 범위 내 OK |
| 6 | Decorative blobs | aurora-bg radial gradients — 과하지 않으면 OK |
| 7 | Emoji as design elements | 없음 — OK |
| 8 | Colored left-border cards | 없음 — OK |
| 9 | Generic hero copy | "당신의 데이터로 만드는 AI 챗봇" — 구체적, OK |
| 10 | Cookie-cutter section rhythm | 구조는 일반적이나 3D 데모로 차별화 |
| 11 | system-ui as primary font | **⚠️ 위험: Pretendard 미로드 시 system-ui fallback** |

**핵심 위험:** Features 섹션이 가장 전형적인 AI-slop 레이아웃. 고쳐야 함.

---

## 6. Responsive & Accessibility

### Breakpoints

```
mobile:  < 640px  (sm)
tablet:  640-1024px (sm-lg)
desktop: > 1024px (lg+)
```

### Mobile-Specific Rules

```
Header:
  mobile: 로고 + 햄버거 메뉴 (현재 미정의 — TODO #3)
  mobile nav: full-screen overlay 또는 bottom sheet
  
Hero:
  mobile: 3D scene 높이 줄임 (성능), 텍스트 5xl→4xl
  mobile: CTA 버튼 full-width
  
Features:
  mobile: 1-column 스택 (현재 sm:grid-cols-2 → OK)
  
HowItWorks:
  mobile: 세로 스택, 연결선 제거 (현재 hidden md:block → OK)

Pricing:
  mobile: 1-column 스택, Popular 티어 먼저
```

### Accessibility Requirements (WCAG 2.1 AA)

```
색상 대비:
  Body text:      최소 4.5:1 (ink-50 on ink-900 = ~18:1 ✓)
  Muted text:     ink-50/60 on ink-900 → 검증 필요 (TODO #4)
  CTA 버튼:       brand-600 bg on white text → 검증 필요 (TODO #4)
  
키보드 네비게이션:
  모든 인터랙티브 요소에 focus-visible ring
  현재 글로벌 focus 스타일 없음 → TODO #5
  Skip to main content 링크 → TODO #5
  
터치 타겟:
  최소 44×44px (모바일)
  현재 CTA 버튼 py-3.5 → ~56px ✓
  아이콘 버튼 12×12 → ✗ 확인 필요
  
스크린 리더:
  ARIA 랜드마크: <main>, <nav>, <header>, <footer> → 확인 필요
  이미지 대체 텍스트: 3D Canvas aria-hidden="true" → TODO #6
  챗봇 위젯: role="dialog", aria-label → TODO #6

prefers-reduced-motion:
  모든 Framer Motion 애니메이션에 적용 → TODO #2
```

---

## 7. What Already Exists (재사용 목록)

| 항목 | 위치 | 상태 |
|------|------|------|
| `.glass` | globals.css | ✓ 사용 가능 |
| `.aurora-bg` | globals.css | ✓ 사용 가능 |
| `.gradient-text` | globals.css | ✓ 사용 가능 |
| `brand.*` 색상 스케일 | tailwind.config.ts | ✓ |
| `ink.*` 색상 | tailwind.config.ts | ✓ |
| Framer Motion fade-up 패턴 | 모든 섹션 컴포넌트 | ✓ |
| `rounded-3xl` + `p-7` 카드 패턴 | Features, Pricing | ✓ |
| `whileInView` 스크롤 진입 | Features, Pricing, HowItWorks | ✓ |
| `font-display` (Pretendard) | tailwind.config.ts | ⚠️ 폰트 로드 필요 |

---

## 8. NOT In Scope (이번 세션)

| 항목 | 이유 |
|------|------|
| 대시보드 상세 디자인 시스템 | 화면 코드 미열람, 다음 세션 |
| 위젯 커스터마이징 UI | 백엔드 API 스펙 먼저 확정 필요 |
| 다국어 레이아웃 (RTL 등) | 현재 한국어/영어만 대상 |
| 다크/라이트 모드 토글 | 다크 전용으로 브랜드 확정됨 |
| 애니메이션 상세 인터랙션 스펙 | Framer Motion 기존 패턴 재사용 |

---

## 9. Open Design Decisions (미결)

| # | 결정 필요 사항 | 미룰 경우 발생하는 일 |
|---|----------------|----------------------|
| D1 | 모바일 헤더 네비게이션 패턴 | ✅ 해결: hamburger + AnimatePresence dropdown |
| D2 | Features AI-slop 위험 해결 방식 | ✅ 해결: 2-column 문제→해결→수치 스테이트먼트 레이아웃 |
| D3 | Pretendard 로드 방식 | ✅ 해결: CDN (jsdelivr) via layout.tsx `<link>` |
| D4 | 챗봇 목록 페이지 레이아웃 | ✅ 해결: 리스트 유지 (B2B SaaS 작업 중심, 스캐닝 유리) |

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean | 3 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open | score: 5/10 → 7/10, 6 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**ENG FINDINGS (2026-06-06):**
- [P0, FIXED] `Features.tsx` — 곡선따옴표 오염으로 전체 빌드 실패 → ASCII quote 복구, `tsc --noEmit` 통과 검증
- [P2, FIXED] `chatbots/page.tsx` 빈 상태 SVG — 3-path 중첩 + opacity-0 죽은 path → 단일 채팅버블 아이콘 + `aria-hidden`
- [P3, DEFERRED→T4] `layout.tsx` Pretendard CDN render-blocking → self-host은 별도 PR (사용자 승인)

**TESTS:** 프로젝트에 테스트 프레임워크 없음 (기존 상태). 변경은 전부 presentational — 신규 테스트 부채 아님.
**UNRESOLVED:** 0 (디자인 D1-D4 모두 해결, eng P0/P2 수정 완료)
**VERDICT:** ENG CLEARED (build green) — Design 7/10. Ready to implement / ship.
