# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js — `frontend/`)
```bash
npm run dev      # dev server on port 3000 (hot reload)
npm run build    # production build
npm run lint     # ESLint
```

### Backend (FastAPI — `backend/`)
```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

No test suite exists yet. TypeScript type-checking only via `npm run build`.

## Architecture

### Request flow
All `/api/v1/*` calls from the browser hit Next.js, which proxies them to `http://localhost:8000` via rewrites in `next.config.mjs`. The frontend never needs to know the backend URL directly. `/widget.js` is also proxied the same way.

### Auth
JWT stored in `localStorage` under `vivitalk.token`. `src/lib/api.ts` (singleton `Api` class) automatically attaches it as a Bearer header on every request. `src/stores/authStore.ts` (Zustand + persist) wraps login/signup/logout/hydrate. `AuthGuard` redirects unauthenticated users; `hydrate()` must be called once on mount to restore session from localStorage.

### RAG pipeline
Upload → `document_parser.extract_text` (PDF/TXT/MD/HTML) → `split_into_chunks` → `EmbeddingService.create_embeddings` (OpenAI `text-embedding-3-small`, batch 100) → Pinecone upsert. Processing runs as a FastAPI `BackgroundTask`; document `status` transitions `pending → processing → processed | failed`. Retrieval is **hybrid**: dense Pinecone search over `top_k * 4` candidates, then BM25 rerank with score = `max(dense, α·dense + (1-α)·bm25)`. If the best score is below `RAG_SIMILARITY_THRESHOLD`, the bot refuses to answer (hallucination guard).

### Multi-tenancy
Pinecone namespace = `client_{client_id}_chatbot_{chatbot_id}`. Supabase queries always filter on `client_id`. The backend uses the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) for all DB operations — not user-scoped keys.

### Supabase tables
`clients`, `chatbots`, `documents` — defined in `backend/supabase_setup.sql`. `chatbot.configuration` (JSONB) stores `welcome_message` and `primary_color`. `document.metadata` (JSONB) stores `chunk_count`, `size`, `error_message`.

### 3D Landing
`HeroScene` is loaded with `dynamic(() => ..., { ssr: false })` to prevent Three.js SSR crash. Inside the Canvas, `FakeBrowserWindow` renders an HTML mock browser via `@react-three/drei`'s `<Html transform>`. The mock browser contains `FakeWebsite`/`FakeWebsiteAtelier` (pure inline-style divs) and `DemoWidget` (auto-playing chat script loop). All pointer events on the 3D layer are disabled (`pointerEvents: "none"`).

### Embeddable widget
`backend/static/widget.js` is served at `/widget.js`. It injects an iframe or shadow-DOM chat UI into any third-party site using `data-chatbot-id` and `data-api` attributes.

### Tailwind design tokens
- `brand.*` — purple scale (600 = `#7c3aed`, primary CTA color)
- `ink.900` = `#0b0b10` (page background), `ink.50` = `#f7f7f8` (text)
- `.glass` — frosted glass card (used throughout the dark UI)
- `.aurora-bg` — multi-radial hero background
- `.gradient-text` — animated gradient headline

## Environment variables
Copy `backend/.env.example` → `backend/.env` and fill in:
- `OPENAI_API_KEY` — GPT-4o-mini + text-embedding-3-small
- `PINECONE_API_KEY` + `PINECONE_INDEX_NAME` — index dimension must be 1536
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY` — any long random string

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
