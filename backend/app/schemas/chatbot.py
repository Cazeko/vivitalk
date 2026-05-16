from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"


class ChatbotStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ChatbotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    welcome_message: Optional[str] = Field("안녕하세요! 무엇을 도와드릴까요?", max_length=200)
    primary_color: Optional[str] = Field("#7c3aed", max_length=20)
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ChatbotUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    welcome_message: Optional[str] = None
    primary_color: Optional[str] = None
    status: Optional[ChatbotStatus] = None
    configuration: Optional[Dict[str, Any]] = None


class ChatbotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    welcome_message: Optional[str] = None
    primary_color: Optional[str] = None
    status: str = "active"
    widget_code: Optional[str] = None
    configuration: Dict[str, Any] = {}
    document_count: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DocumentResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    type: str
    status: str
    chunk_count: Optional[int] = 0
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: Optional[datetime] = None


class ChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None


class ChatSource(BaseModel):
    document_id: str
    document_name: Optional[str] = None
    snippet: str
    score: float


class ChatResponse(BaseModel):
    response: str
    sources: List[ChatSource] = []
    confidence: float
    session_id: str
    response_time_ms: int


class WidgetInfo(BaseModel):
    chatbot_id: str
    name: str
    welcome_message: str
    primary_color: str
