# Vivitalk

3D 비주얼 AI 챗봇 빌더 SaaS. 비개발자도 PDF/문서를 업로드하고 `<script>` 태그 한 줄로 어떤 웹사이트에든 자기 데이터로 답변하는 챗봇을 띄울 수 있습니다.

## 스택

- **Backend** — FastAPI · OpenAI (GPT-4o-mini, text-embedding-3-small) · Pinecone · Supabase Auth
- **Frontend** — Next.js 14 (App Router) · TypeScript · Tailwind · Three.js (`@react-three/fiber` + `drei`) · Framer Motion · Zustand · Axios
- **RAG** — Hybrid (dense + BM25), citations `[#N]`, hallucination guard

## 핵심 기능

- 3D 애니메이션 랜딩 페이지 (떠다니는 구체 + 채팅 버블 + 입자)
- 회원가입 / 로그인 (Supabase Auth, 자동 이메일 확인)
- 대시보드: 챗봇 CRUD, 드래그앤드롭 문서 업로드, 미리보기 채팅, 임베드 코드, 설정
- 임베드 가능한 위젯 (`<script src="…/widget.js">` 한 줄)
- 멀티테넌시 (Pinecone namespace `client_{cid}_chatbot_{bid}`)
- Hybrid RAG: dense vector + BM25 → max(dense, hybrid) 점수 → 인용 표기

## 실행

### Backend (port 8000)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

### Frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
```

`/api/v1/*` 요청은 `next.config.mjs`의 rewrite로 백엔드(8000)에 자동 프록시됩니다.

## 환경변수

`backend/.env`에 OpenAI / Pinecone / Supabase 키가 들어 있습니다.

## DB

`backend/supabase_setup.sql` 의 SQL을 Supabase SQL Editor에서 한 번 실행하면 됩니다.
(현재는 chatsync에서 이미 만든 `clients`, `chatbots`, `documents` 테이블을 그대로 사용합니다.)

## 디렉토리

```
vivitalk/
├── backend/
│   ├── app/
│   │   ├── api/routes/      auth.py, chatbot.py, widget.py
│   │   ├── core/            config, database, security, logger
│   │   ├── schemas/         auth.py, chatbot.py
│   │   ├── services/        embedding, document_parser, rag (hybrid)
│   │   └── main.py
│   ├── static/widget.js     embeddable JS widget
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx                3D landing
        │   ├── login/, signup/
        │   ├── dashboard/              with [id] detail tabs
        │   └── widget-test/[id]        external-site mock
        ├── components/      Hero, HeroScene, Features, …
        ├── stores/authStore.ts
        └── lib/api.ts
```
