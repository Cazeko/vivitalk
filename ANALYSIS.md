# Vivitalk 심층 분석 보고서

> 작성일: 2026-05-17
> 분석 대상: vivitalk.zip (2026-04-27 작성, 56 소스 파일, ~4,000 LOC)
> 비교 대상: ChatSync (2026-04-21 작성, 같은 개발자의 선행 프로젝트)

---

## 1. 프로젝트 정체성

| 항목 | 내용 |
|---|---|
| 이름 | Vivitalk — "3D 비주얼 AI 챗봇 빌더 SaaS" |
| 저작 시점 | 2026-04-27 (ChatSync 6일 후) |
| 규모 | 56 소스 파일 / 약 4,000 LOC |
| 출처 관계 | README에 "현재는 chatsync에서 이미 만든 clients, chatbots, documents 테이블을 그대로 사용합니다" — **같은 Supabase 프로젝트 `nskopcbdqapeejkahtlo` 공유**, 같은 OpenAI/Pinecone/JWT 키 그대로 |
| 포지셔닝 | ChatSync 아이디어를 "기획 문서 0, 데모 우선"으로 재시도 |

## 2. 기술 스택

```
백엔드   FastAPI 0.115 · OpenAI · Pinecone(serverless aws-us-east-1) · Supabase Auth
         pypdf 5.0 · rank-bm25 0.2 · slowapi (설치만, 미사용)
프론트   Next.js 14.2.16 · TS · Tailwind · Zustand 5
         @react-three/fiber + drei · framer-motion 11
RAG      Hybrid (dense + BM25) · max(dense, hybrid) 융합 · 인용 [#N] · 환각 가드
위젯     ~200줄 vanilla JS, zero deps
```

## 3. 진척도 — 약 60~70% (ChatSync 15~20%의 3~4배)

### ✅ 실제로 동작하는 부분

- **회원가입/로그인** — `sb.auth.admin.create_user`로 이메일 인증 자동 통과 (개발 편의)
- **챗봇 CRUD** — 실제 Supabase 연동, 프론트도 mock 0%
- **PDF/TXT/MD/HTML 업로드** — `pypdf` 진짜 파싱, 20MB 제한, BackgroundTask 처리
- **문장 경계 인식 청킹** — 마지막 200자 구간에서 `.!?。！？` 찾아 끊음 (chunk_size=450, overlap=80)
- **OpenAI 임베딩 배치** — 96개씩 묶어 호출
- **Hybrid RAG 검색** — Pinecone top_k×4 후보 → BM25 재랭킹 → `max(dense, alpha·dense + (1-alpha)·bm25)`
- **환각 가드** — 1위 점수가 `RAG_SIMILARITY_THRESHOLD` (.env=0.15) 미만이면 "자료에 없습니다" 응답
- **인용 표기** — 시스템 프롬프트에서 `[#1][#2]` 강제, 응답 `sources` 배열에 document_name 매핑
- **대화 히스토리** — 마지막 6턴 LLM에 주입
- **임베드 위젯** — `<script src=".../widget.js" data-chatbot-id="...">` 한 줄로 동작, 채팅 버블, 입력, 출처 3개 표시, 세션 ID 유지
- **위젯 테스트 페이지** (`/widget-test/[id]`) — 외부 사이트 시뮬레이션
- **3D 랜딩** — Three.js `FloatingOrb` + `ChatBubble3D` + `ParticleField` + `Stars` + `OrbitControls auto-rotate`
- **대시보드 챗봇 디테일 탭** (`/dashboard/chatbots/[id]`) — sources / preview / embed / settings 4탭
- **드래그앤드롭 업로드** + 4초 폴링으로 처리 상태 자동 갱신
- **챗봇 삭제 시 Pinecone 네임스페이스 정리** (`index.delete(delete_all=True, namespace=ns)`)
- **문서 삭제 시 벡터 ID로 정확 삭제** (`document_id_0`, `_1`, ..., `_n`)
- **Pinecone 인덱스 자동 생성** (`create_index` if missing, 1536-dim cosine, serverless)
- **next.config.mjs rewrite** — `/api/v1/*` → 백엔드로 자동 프록시 (CORS 회피)

### ⚠️ 반쪽

- **결제 UI** — `BillingPage`는 카드 3장 + "결제 시스템은 곧 출시됩니다 (PortOne 연동 예정)" 문구만
- **대화 영속화** — `chat_sessions`/`chat_messages` 테이블 스키마 있지만 코드에서 한 번도 INSERT 안 함
- **`supabase_setup.sql`의 `users` 테이블** — 코드는 `auth.users`만 사용, 자체 `password_hash` 테이블 완전 dead

### ❌ 미착수

- 결제 실연동 (PortOne)
- Rate limiting (slowapi 설치만 됨)
- 위젯 도메인 제한 (CORS / Referer 화이트리스트)
- 스트리밍 응답 (SSE/WebSocket)
- URL 스크래핑
- 사용량 카운팅 / 대시보드 통계
- 분석/모니터링
- 테스트 코드 0건

---

## 4. 🚨 보안 이슈 — ChatSync 답습 + 신규 1건

### (a) 시크릿 누출 — `backend/.env` (zip에 포함)

```
OPENAI_API_KEY=sk-proj-NvViP55cOXh8...     ← ChatSync와 동일
PINECONE_API_KEY=pcsk_kQG15_Hw2Sei...      ← ChatSync와 동일
SUPABASE_SERVICE_ROLE_KEY=sb_secret_tyPnur7b04l808oXyrcfYA_DxazauSy
JWT_SECRET_KEY=d1d3b010-8f5d-4d79-...      ← ChatSync와 동일
FRONTEND_URL=http://223.195.111.38:3000    ← 공인 IP 노출
```

- `.env.example`는 깔끔히 placeholder (ChatSync보다 개선) — 하지만 `.env` 자체가 zip에 포함됨
- 같은 Supabase 프로젝트 + 같은 OpenAI 키 → ChatSync 키가 한 번이라도 공개됐다면 Vivitalk도 즉시 침해

### (b) IDOR — `delete_chatbot` (`backend/app/api/routes/chatbot.py:166~180`)

```python
@router.delete("/{chatbot_id}")
async def delete_chatbot(chatbot_id, current_user):
    # ownership 사전 검증 없음!
    index.delete(delete_all=True, namespace=f"client_{me}_chatbot_{victim_id}")  # 잘못된 ns → no-op
    sb.table("documents").delete().eq("chatbot_id", chatbot_id).execute()  # ← client_id 필터 없음!
    sb.table("chatbots").delete().eq("id", chatbot_id).eq("client_id", me).execute()  # 효과 없음
```

챗봇 자체 삭제는 막히지만 **다른 사용자의 documents는 전부 삭제됨**. UUID 추측 시 데이터 파괴 가능.

### (c) CORS 와일드카드 + `allow_credentials=True`

`backend/app/core/config.py:43` + `backend/app/main.py:42~48` — `"*"` 포함하면서 credentials 허용. 브라우저 거부지만 스펙 위반.

### (d) 위젯 API 무제한 (`backend/app/api/routes/widget.py`)

`/api/v1/widget/{chatbot_id}/chat` 는 인증 없음 (의도된 설계). 하지만:

- 도메인 제한 없음 — 누구나 다른 사이트에 임베드 가능
- Rate limit 없음 — 한 사람이 API 비용 폭발 가능
- 봇 활성 상태만 체크 (`if status != "active"`)

### (e) RLS = `USING (false)` (ChatSync와 동일)

DB 레벨 격리 0, Service Role + 백엔드 `eq('client_id')` 필터만이 방어선.

---

## 5. 코드 품질 — ChatSync 대비 큰 개선

| 항목 | ChatSync | Vivitalk |
|---|---|---|
| 죽은 파일 | `security_complete.py`, `mock_auth.py`, `authStore_backup.ts`, 빈 `store/` | 없음 |
| 헬퍼 함수 | 중복 코드 다수 | `_serialize_chatbot`, `_patch_doc_metadata`, `_widget_code` 패턴 |
| 미들웨어 | `matcher: []` 죽음 | next rewrite로 실효성 있게 사용 |
| Auth 모듈 | 자체 JWT(미사용) + Supabase 검증 혼재 | Supabase 검증만 (`security.py` 55줄) |
| 프론트 store | 통합 큰 store 1개 | `authStore` 작고 명료 (hydrated 패턴) |
| 환경 변수 | `.env.example`에 실키 | `.env.example`는 placeholder |
| 정직성 | "완료"라고 적힌 기능이 mock | placeholder는 placeholder라고 표기 |

### 남은 자잘한 이슈

- `chatbots/[id]/page.tsx:70` — 4초마다 `listDocuments` 폴링이 처리 끝나도 계속됨
- `WidgetTestPage` — `${window.location.hostname}:8000` 하드코딩, 프로덕션 HTTPS/다른 포트면 깨짐
- `widget.js` boot 실패 시 사용자 피드백 없음 (콘솔 에러만)
- `supabase_setup.sql`의 `users` 테이블 — dead 스키마
- `requirements.txt:14`에 `slowapi==0.1.9` 있는데 import도 사용도 0건
- `config.py:43`에 `"*"` 포함된 CORS 기본값 — `.env`가 덮어쓰지만 안전 가드 부족

---

## 6. ChatSync vs Vivitalk 비교

| 측면 | ChatSync | Vivitalk |
|---|---|---|
| 기획 문서 | 개발계획서.md 35주 일정, 제안서, 진행과정×4개 | README 1장만 |
| 제목 | 챗봇 빌더 (가제) | 챗봇 빌더 (확정 + 3D 브랜딩) |
| RAG | placeholder | 실제 Hybrid + 가드 + 인용 |
| PDF 파싱 | `"PDF text extraction would be implemented here"` | `pypdf` 실구현 |
| 위젯 | iframe URL 문자열만 | 200줄 vanilla JS, escape 처리, 세션, 출처 표시 |
| 대시보드 | 7개 페이지 전부 mock | 4개 + 탭, 100% 실 API |
| 사용자 흐름 | 회원가입→로그인→대시보드 (mock으로 끝) | 회원가입→PDF 업로드→대화→임베드 코드 복사→외부 페이지 테스트 (실제 동작) |
| 결제 | mock 카드/구독/사용량 화면 | "곧 출시" 정직 표기 |
| 3D 비주얼 | 없음 | Three.js orbs + particles + chat bubble |
| 시크릿 위생 | `.env.example`에 실키 | `.env`에 실키 (zip 포함) |
| IDOR | `delete_chatbot`/`delete_document` 양쪽 | `delete_chatbot` 1건 (documents 부분만) |
| 죽은 코드 | 5건 | 1건 (dead users 테이블) |
| 테스트 | 0 | 0 |
| 진척도 체감 | 15~20% | **60~70%** |

---

## 7. 우선순위별 즉시 권장 조치

### P0 — 보안 (오늘 안에)

1. **`.env`를 zip/git에서 제거** + `.gitignore`에 `backend/.env` 명시
2. **4개 시크릿 전부 회전** (OpenAI / Pinecone / Supabase Service Role / JWT)
3. **`delete_chatbot` IDOR 패치** — `chatbot.py:178`에 ownership 사전 검증 + documents 삭제 시 `.eq('client_id', client_id)` 추가
4. **CORS `"*"` 제거** — 실제 도메인만 허용 (`config.py:43`, `.env`)

### P1 — 위젯 안전 (이번 주)

5. **위젯 rate limit** — 이미 설치된 `slowapi` 활용해서 `widget.py`에 데코레이터
   - `/widget/{id}/chat`: 분당 30회/IP, 챗봇당 시간당 1000회
6. **위젯 도메인 화이트리스트** — `data-domain` attribute + Referer/Origin 헤더 검증
7. **위젯 비용 한도** — 챗봇별 일일 OpenAI 토큰 한도 (메타데이터 카운터)

### P2 — 완성도 (다음 주)

8. **대화 영속화** — `chat_sessions`/`chat_messages` 테이블 INSERT 로직 추가 (스키마 이미 존재)
9. **`supabase_setup.sql`의 죽은 `users` 테이블 제거**
10. **챗봇 디테일 폴링** — 처리 중 문서가 있을 때만 폴링, 다 끝나면 멈춤
11. **테스트** — 최소 auth + chatbot CRUD pytest 3건

### P3 — 비즈니스 (1-2주)

12. **사용량 카운터** — 챗봇별 메시지/토큰 카운트, 대시보드 위젯
13. **결제 PortOne 연동** — 베타까지 미뤄도 무방
14. **URL 스크래핑** — `BeautifulSoup` + `httpx` (`document_parser.py`에 추가)
15. **스트리밍 응답** — SSE로 OpenAI chunk 단위 전송 (UX 큰 차이)

---

## 8. 평가 요약

Vivitalk은 ChatSync의 시행착오를 학습한 **"데모 우선" 재작성**입니다.

- **잘한 결정**: 문서 7개 쓰고 mock UI 만들기 대신 README 1장 + 진짜 동작하는 좁은 코어. RAG/PDF/위젯 3대 핵심을 실제로 굴러가게 했습니다.
- **개선된 자세**: ChatSync에서는 `extract_pdf_text` placeholder를 "완료"로 분류했는데, Vivitalk은 결제를 "곧 출시"로 솔직하게 표기.
- **3D 브랜딩 차별화**: HeroScene이 "이건 그냥 또 다른 챗봇 빌더가 아니다"라는 시각적 시그널.
- **여전히 못 고친 것**: 시크릿 노출 습관, IDOR 패턴, 레이트리밋 부재. **같은 키를 두 프로젝트가 공유 중**이라 한 곳 노출 = 양쪽 모두 노출.

P0 4건만 막으면 외부 사람에게 데모해도 부끄럽지 않은 수준입니다.
