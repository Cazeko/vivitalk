"""Advanced RAG: hybrid search (dense + BM25), reranking, citation, hallucination guard."""
from typing import Any, Dict, List, Optional, Tuple
import logging
import math
import re

from openai import OpenAI
from rank_bm25 import BM25Okapi

from app.core.config import settings
from app.core.database import get_pinecone_index, get_admin_supabase
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


def _tokenize(text: str) -> List[str]:
    return re.findall(r"\w+", (text or "").lower())


class RAGService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.embedding = EmbeddingService()

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------
    def hybrid_search(
        self,
        query: str,
        client_id: str,
        chatbot_id: str,
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Dense vector search via Pinecone + BM25 rerank over the candidates."""
        top_k = top_k or settings.RAG_TOP_K
        namespace = f"client_{client_id}_chatbot_{chatbot_id}"

        # Dense search
        try:
            q_emb = self.embedding.create_embedding(query)
            index = get_pinecone_index()
            dense = index.query(
                vector=q_emb,
                top_k=max(top_k * 4, 20),
                namespace=namespace,
                include_metadata=True,
            )
            matches = dense.matches or []
        except Exception as e:
            logger.error(f"Pinecone query failed: {e}")
            matches = []

        if not matches:
            return []

        # BM25 over candidate texts
        candidates = []
        corpus_tokens = []
        for m in matches:
            md = m.metadata or {}
            text = md.get("text", "")
            candidates.append({
                "id": m.id,
                "text": text,
                "dense_score": float(m.score or 0.0),
                "metadata": md,
            })
            corpus_tokens.append(_tokenize(text))

        try:
            bm25 = BM25Okapi(corpus_tokens)
            bm25_scores = bm25.get_scores(_tokenize(query))
            max_b = max(bm25_scores) if len(bm25_scores) else 0.0
            if max_b > 0:
                bm25_norm = [float(s / max_b) for s in bm25_scores]
            else:
                bm25_norm = [0.0] * len(candidates)
        except Exception:
            bm25_norm = [0.0] * len(candidates)

        # Combine. Use max of (dense, hybrid) so a strong dense match is never
        # penalized by a zero BM25 (e.g., when only one chunk exists).
        alpha = settings.RAG_HYBRID_ALPHA  # weight for dense
        for c, bm in zip(candidates, bm25_norm):
            c["bm25_score"] = bm
            hybrid = alpha * c["dense_score"] + (1 - alpha) * bm
            c["score"] = max(c["dense_score"], hybrid)

        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates[:top_k]

    # ------------------------------------------------------------------
    # Generation
    # ------------------------------------------------------------------
    def generate_answer(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        chatbot_name: str = "Vivitalk Assistant",
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.3,
    ) -> Tuple[str, float]:
        # Hallucination guard: if every candidate is below threshold, refuse
        if not candidates or candidates[0]["score"] < settings.RAG_SIMILARITY_THRESHOLD:
            return (
                "죄송합니다. 제공된 자료에 해당 내용이 없어 답변을 드리기 어렵습니다. "
                "조금 더 구체적으로 질문해 주시거나 관련 문서를 추가해 주세요.",
                0.0,
            )

        # Build context block with [#n] citations
        ctx_lines = []
        for i, c in enumerate(candidates, start=1):
            snippet = c["text"][:800]
            ctx_lines.append(f"[#{i}] {snippet}")
        context = "\n\n".join(ctx_lines)

        system_prompt = (
            f"당신은 {chatbot_name}입니다. 사용자의 질문에 한국어로 친절하고 정확하게 답변합니다.\n"
            "- 반드시 아래 컨텍스트 안의 사실만 사용하세요.\n"
            "- 컨텍스트에 답이 없으면 모른다고 솔직하게 말하세요.\n"
            "- 답변 끝에 사용한 근거를 [#1], [#2] 형식으로 인용하세요.\n"
            "- 추측하거나 외부 지식을 끌어오지 마세요."
        )

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        if history:
            for h in history[-6:]:
                if h.get("role") in ("user", "assistant") and h.get("content"):
                    messages.append({"role": h["role"], "content": h["content"]})
        messages.append({
            "role": "user",
            "content": f"컨텍스트:\n{context}\n\n질문: {query}\n\n답변:",
        })

        try:
            res = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=700,
            )
            answer = res.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI chat failed: {e}")
            answer = "죄송합니다. 일시적인 오류로 답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요."

        confidence = candidates[0]["score"] if candidates else 0.0
        return answer, confidence

    # ------------------------------------------------------------------
    # End-to-end
    # ------------------------------------------------------------------
    def answer(
        self,
        query: str,
        client_id: str,
        chatbot_id: str,
        chatbot_name: str = "Vivitalk Assistant",
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        candidates = self.hybrid_search(query, client_id, chatbot_id)
        # Resolve document names for citations
        if candidates:
            doc_ids = list({c["metadata"].get("document_id") for c in candidates if c["metadata"].get("document_id")})
            doc_names: Dict[str, str] = {}
            try:
                if doc_ids:
                    sb = get_admin_supabase()
                    res = sb.table("documents").select("id,name").in_("id", doc_ids).execute()
                    for row in (res.data or []):
                        doc_names[row["id"]] = row.get("name") or row["id"]
            except Exception as e:
                logger.warning(f"Doc name lookup failed: {e}")
            for c in candidates:
                did = c["metadata"].get("document_id")
                c["document_name"] = doc_names.get(did, did)

        answer, confidence = self.generate_answer(
            query=query,
            candidates=candidates,
            chatbot_name=chatbot_name,
            history=history,
        )

        sources = []
        for c in candidates:
            sources.append({
                "document_id": c["metadata"].get("document_id", "unknown"),
                "document_name": c.get("document_name") or c["metadata"].get("document_id", "unknown"),
                "snippet": c["text"][:240],
                "score": round(float(c["score"]), 4),
            })

        return {"response": answer, "sources": sources, "confidence": confidence}
