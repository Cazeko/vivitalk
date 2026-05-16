"""Public widget endpoints - no auth required, identified by chatbot_id."""
import logging
import time
import uuid

from fastapi import APIRouter, HTTPException, Request

from app.core.database import get_admin_supabase
from app.schemas.chatbot import ChatMessageIn, ChatResponse, ChatSource, WidgetInfo
from app.services.rag_service import RAGService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{chatbot_id}", response_model=WidgetInfo)
async def widget_info(chatbot_id: str):
    sb = get_admin_supabase()
    res = sb.table("chatbots").select("*").eq("id", chatbot_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    bot = res.data[0]
    if bot.get("status") != "active":
        raise HTTPException(status_code=403, detail="Chatbot inactive")
    cfg = bot.get("configuration") or {}
    return WidgetInfo(
        chatbot_id=bot["id"],
        name=bot.get("name") or "Vivitalk",
        welcome_message=cfg.get("welcome_message") or "안녕하세요! 무엇을 도와드릴까요?",
        primary_color=cfg.get("primary_color") or "#7c3aed",
    )


@router.post("/{chatbot_id}/chat", response_model=ChatResponse)
async def widget_chat(chatbot_id: str, payload: ChatMessageIn, request: Request):
    sb = get_admin_supabase()
    res = sb.table("chatbots").select("*").eq("id", chatbot_id).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    bot = res.data[0]
    if bot.get("status") != "active":
        raise HTTPException(status_code=403, detail="Chatbot inactive")

    t0 = time.time()
    rag = RAGService()
    result = rag.answer(
        query=payload.message,
        client_id=bot["client_id"],
        chatbot_id=chatbot_id,
        chatbot_name=bot.get("name") or "Vivitalk Assistant",
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
