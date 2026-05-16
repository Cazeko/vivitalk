"""Chatbot CRUD + document upload + chat (auth-protected). Uses existing chatsync DB schema."""
from datetime import datetime
from typing import Any, Dict, List
import logging
import time
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile

from app.core.config import settings
from app.core.database import get_admin_supabase, get_pinecone_index
from app.core.security import get_current_user
from app.schemas.chatbot import (
    ChatbotCreate,
    ChatbotResponse,
    ChatbotUpdate,
    ChatMessageIn,
    ChatResponse,
    ChatSource,
    DocumentResponse,
)
from app.services.document_parser import extract_text, split_into_chunks
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RAGService

router = APIRouter()
logger = logging.getLogger(__name__)


def _widget_code(chatbot_id: str) -> str:
    backend = settings.PUBLIC_BACKEND_URL.rstrip("/")
    return (
        f'<script src="{backend}/widget.js" '
        f'data-chatbot-id="{chatbot_id}" '
        f'data-api="{backend}" defer></script>'
    )


def _serialize_chatbot(row: Dict[str, Any]) -> ChatbotResponse:
    cfg = row.get("configuration") or {}
    return ChatbotResponse(
        id=row["id"],
        name=row.get("name") or "",
        description=row.get("description"),
        welcome_message=cfg.get("welcome_message") or "안녕하세요! 무엇을 도와드릴까요?",
        primary_color=cfg.get("primary_color") or "#7c3aed",
        status=row.get("status") or "active",
        widget_code=row.get("widget_code"),
        configuration=cfg,
        document_count=row.get("document_count", 0) or 0,
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


@router.post("", response_model=ChatbotResponse)
async def create_chatbot(payload: ChatbotCreate, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    client_id = current_user.get("client_id")
    if not client_id:
        raise HTTPException(status_code=400, detail="Client not found")

    chatbot_id = str(uuid.uuid4())
    cfg = dict(payload.configuration or {})
    cfg["welcome_message"] = payload.welcome_message
    cfg["primary_color"] = payload.primary_color

    row = {
        "id": chatbot_id,
        "client_id": client_id,
        "tenant_id": client_id,
        "name": payload.name,
        "description": payload.description,
        "status": "active",
        "widget_code": _widget_code(chatbot_id),
        "configuration": cfg,
    }
    try:
        sb.table("chatbots").insert(row).execute()
    except Exception as e:
        logger.error(f"chatbot insert failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    saved = sb.table("chatbots").select("*").eq("id", chatbot_id).limit(1).execute().data[0]
    return _serialize_chatbot(saved)


@router.get("", response_model=List[ChatbotResponse])
async def list_chatbots(current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    res = (
        sb.table("chatbots")
        .select("*")
        .eq("client_id", current_user["client_id"])
        .order("created_at", desc=True)
        .execute()
    )
    items = res.data or []
    if items:
        for item in items:
            try:
                cnt = sb.table("documents").select("id", count="exact").eq("chatbot_id", item["id"]).execute()
                item["document_count"] = cnt.count or 0
            except Exception:
                item["document_count"] = 0
    return [_serialize_chatbot(i) for i in items]


@router.get("/{chatbot_id}", response_model=ChatbotResponse)
async def get_chatbot(chatbot_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    res = (
        sb.table("chatbots")
        .select("*")
        .eq("id", chatbot_id)
        .eq("client_id", current_user["client_id"])
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    item = res.data[0]
    try:
        cnt = sb.table("documents").select("id", count="exact").eq("chatbot_id", chatbot_id).execute()
        item["document_count"] = cnt.count or 0
    except Exception:
        item["document_count"] = 0
    return _serialize_chatbot(item)


@router.put("/{chatbot_id}", response_model=ChatbotResponse)
async def update_chatbot(chatbot_id: str, payload: ChatbotUpdate, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    existing = (
        sb.table("chatbots")
        .select("*")
        .eq("id", chatbot_id)
        .eq("client_id", current_user["client_id"])
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    row = existing.data[0]
    cfg = dict(row.get("configuration") or {})
    update: Dict[str, Any] = {}
    if payload.name is not None:
        update["name"] = payload.name
    if payload.description is not None:
        update["description"] = payload.description
    if payload.status is not None:
        update["status"] = payload.status.value if hasattr(payload.status, "value") else payload.status
    if payload.welcome_message is not None:
        cfg["welcome_message"] = payload.welcome_message
    if payload.primary_color is not None:
        cfg["primary_color"] = payload.primary_color
    if payload.configuration is not None:
        cfg.update(payload.configuration)
    update["configuration"] = cfg

    sb.table("chatbots").update(update).eq("id", chatbot_id).eq("client_id", current_user["client_id"]).execute()
    saved = sb.table("chatbots").select("*").eq("id", chatbot_id).limit(1).execute().data[0]
    return _serialize_chatbot(saved)


@router.delete("/{chatbot_id}")
async def delete_chatbot(chatbot_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    try:
        index = get_pinecone_index()
        ns = f"client_{current_user['client_id']}_chatbot_{chatbot_id}"
        try:
            index.delete(delete_all=True, namespace=ns)
        except Exception as e:
            logger.warning(f"pinecone namespace delete: {e}")
    except Exception as e:
        logger.warning(f"pinecone init: {e}")
    sb.table("documents").delete().eq("chatbot_id", chatbot_id).execute()
    sb.table("chatbots").delete().eq("id", chatbot_id).eq("client_id", current_user["client_id"]).execute()
    return {"message": "deleted"}


# ------------------------------------------------------------------
# Documents
# ------------------------------------------------------------------
def _serialize_document(row: Dict[str, Any]) -> DocumentResponse:
    md = row.get("metadata") or {}
    return DocumentResponse(
        id=row["id"],
        chatbot_id=row["chatbot_id"],
        name=row.get("name") or "",
        type=row.get("type") or "text",
        status=row.get("status") or "pending",
        chunk_count=int(md.get("chunk_count", 0) or 0),
        error_message=md.get("error_message"),
        metadata=md,
        created_at=row.get("created_at"),
    )


def _patch_doc_metadata(sb, document_id: str, patch: Dict[str, Any], status: str | None = None):
    cur = sb.table("documents").select("metadata").eq("id", document_id).limit(1).execute()
    md = (cur.data[0].get("metadata") if cur.data else None) or {}
    md.update(patch)
    update: Dict[str, Any] = {"metadata": md}
    if status:
        update["status"] = status
    sb.table("documents").update(update).eq("id", document_id).execute()


def _process_document(document_id: str, chatbot_id: str, client_id: str, raw_text: str):
    sb = get_admin_supabase()
    try:
        _patch_doc_metadata(sb, document_id, {"started_at": datetime.utcnow().isoformat()}, status="processing")
        chunks = split_into_chunks(raw_text)
        if not chunks:
            _patch_doc_metadata(sb, document_id, {"error_message": "No text extracted"}, status="failed")
            return

        embedder = EmbeddingService()
        embeddings = embedder.create_embeddings(chunks)
        vectors = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            vectors.append({
                "id": f"{document_id}_{i}",
                "values": emb,
                "metadata": {
                    "document_id": document_id,
                    "chatbot_id": chatbot_id,
                    "client_id": client_id,
                    "chunk_index": i,
                    "text": chunk,
                },
            })
        index = get_pinecone_index()
        ns = f"client_{client_id}_chatbot_{chatbot_id}"
        for i in range(0, len(vectors), 100):
            index.upsert(vectors=vectors[i:i + 100], namespace=ns)

        _patch_doc_metadata(sb, document_id, {
            "chunk_count": len(chunks),
            "processed_at": datetime.utcnow().isoformat(),
        }, status="processed")
        logger.info(f"Processed document {document_id}: {len(chunks)} chunks")
    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        try:
            _patch_doc_metadata(sb, document_id, {"error_message": str(e)[:500]}, status="failed")
        except Exception:
            pass


@router.post("/{chatbot_id}/documents", response_model=DocumentResponse)
async def upload_document(
    chatbot_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    sb = get_admin_supabase()
    cres = sb.table("chatbots").select("id").eq("id", chatbot_id).eq("client_id", current_user["client_id"]).limit(1).execute()
    if not cres.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")

    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="파일은 20MB 이하만 가능합니다")

    text = extract_text(file.filename or "", file.content_type, data)
    if not text.strip():
        raise HTTPException(status_code=400, detail="텍스트를 추출할 수 없습니다 (지원: PDF/TXT/MD/HTML)")

    document_id = str(uuid.uuid4())
    name_lower = (file.filename or "").lower()
    doc_type = "pdf" if name_lower.endswith(".pdf") else ("html" if name_lower.endswith((".html", ".htm")) else "text")
    row = {
        "id": document_id,
        "chatbot_id": chatbot_id,
        "client_id": current_user["client_id"],
        "tenant_id": current_user["client_id"],
        "name": file.filename or f"document-{document_id[:8]}",
        "type": doc_type,
        "status": "pending",
        "metadata": {
            "size": len(data),
            "content_type": file.content_type,
            "chunk_count": 0,
        },
    }
    sb.table("documents").insert(row).execute()
    background_tasks.add_task(_process_document, document_id, chatbot_id, current_user["client_id"], text)
    saved = sb.table("documents").select("*").eq("id", document_id).limit(1).execute().data[0]
    return _serialize_document(saved)


@router.get("/{chatbot_id}/documents", response_model=List[DocumentResponse])
async def list_documents(chatbot_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    res = (
        sb.table("documents")
        .select("*")
        .eq("chatbot_id", chatbot_id)
        .eq("client_id", current_user["client_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return [_serialize_document(d) for d in (res.data or [])]


@router.delete("/{chatbot_id}/documents/{document_id}")
async def delete_document(chatbot_id: str, document_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    try:
        d = sb.table("documents").select("metadata").eq("id", document_id).limit(1).execute()
        cc = int(((d.data[0].get("metadata") or {}).get("chunk_count") or 0)) if d.data else 0
        if cc > 0:
            index = get_pinecone_index()
            ns = f"client_{current_user['client_id']}_chatbot_{chatbot_id}"
            ids = [f"{document_id}_{i}" for i in range(cc)]
            for i in range(0, len(ids), 1000):
                try:
                    index.delete(ids=ids[i:i + 1000], namespace=ns)
                except Exception as e:
                    logger.warning(f"vector delete: {e}")
    except Exception as e:
        logger.warning(f"doc delete cleanup: {e}")
    sb.table("documents").delete().eq("id", document_id).eq("chatbot_id", chatbot_id).eq("client_id", current_user["client_id"]).execute()
    return {"message": "deleted"}


# ------------------------------------------------------------------
# Chat (authenticated preview)
# ------------------------------------------------------------------
@router.post("/{chatbot_id}/chat", response_model=ChatResponse)
async def chat_with_bot(chatbot_id: str, payload: ChatMessageIn, current_user: dict = Depends(get_current_user)):
    sb = get_admin_supabase()
    cres = sb.table("chatbots").select("*").eq("id", chatbot_id).eq("client_id", current_user["client_id"]).limit(1).execute()
    if not cres.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    chatbot = cres.data[0]

    t0 = time.time()
    rag = RAGService()
    result = rag.answer(
        query=payload.message,
        client_id=current_user["client_id"],
        chatbot_id=chatbot_id,
        chatbot_name=chatbot.get("name") or "Vivitalk Assistant",
        history=payload.history,
    )
    elapsed_ms = int((time.time() - t0) * 1000)
    return ChatResponse(
        response=result["response"],
        sources=[ChatSource(**s) for s in result["sources"]],
        confidence=float(result["confidence"]),
        session_id=payload.session_id or str(uuid.uuid4()),
        response_time_ms=elapsed_ms,
    )
