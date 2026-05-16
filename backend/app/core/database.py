"""Database clients: Supabase + Pinecone."""
from typing import Optional
import logging

from supabase import create_client, Client
from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase: Optional[Client] = None
_pinecone: Optional[Pinecone] = None
_pinecone_index = None


def init_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized")
    return _supabase


def get_supabase() -> Client:
    return init_supabase()


def get_admin_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def init_pinecone():
    global _pinecone, _pinecone_index
    if _pinecone is None:
        _pinecone = Pinecone(api_key=settings.PINECONE_API_KEY)
        logger.info("Pinecone client initialized")

    if _pinecone_index is None:
        try:
            existing = [i.name for i in _pinecone.list_indexes()]
            if settings.PINECONE_INDEX_NAME not in existing:
                logger.info(f"Creating Pinecone index: {settings.PINECONE_INDEX_NAME}")
                _pinecone.create_index(
                    name=settings.PINECONE_INDEX_NAME,
                    dimension=1536,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
            _pinecone_index = _pinecone.Index(settings.PINECONE_INDEX_NAME)
            logger.info(f"Connected to Pinecone index: {settings.PINECONE_INDEX_NAME}")
        except Exception as e:
            logger.warning(f"Pinecone index init issue (will retry on use): {e}")
            _pinecone_index = None
    return _pinecone


def get_pinecone() -> Pinecone:
    if _pinecone is None:
        init_pinecone()
    return _pinecone


def get_pinecone_index():
    global _pinecone_index
    if _pinecone_index is None:
        init_pinecone()
    if _pinecone_index is None:
        _pinecone_index = get_pinecone().Index(settings.PINECONE_INDEX_NAME)
    return _pinecone_index


async def init_db():
    init_supabase()
    init_pinecone()


def check_db_health():
    health = {"supabase": False, "pinecone": False}
    try:
        get_supabase().table("clients").select("id").limit(1).execute()
        health["supabase"] = True
    except Exception as e:
        logger.error(f"Supabase health: {e}")
    try:
        get_pinecone().list_indexes()
        health["pinecone"] = True
    except Exception as e:
        logger.error(f"Pinecone health: {e}")
    return health
