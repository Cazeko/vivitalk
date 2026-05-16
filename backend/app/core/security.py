"""Authentication: validate Supabase Auth JWT, derive client_id."""
from typing import Optional
import logging

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_admin_supabase

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    sb = get_admin_supabase()
    try:
        res = sb.auth.get_user(token)
    except Exception as e:
        logger.error(f"Token verify failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    if not res or not res.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = res.user
    metadata = user.user_metadata or {}
    email = user.email

    # Get or create client (tenant)
    cres = sb.table("clients").select("*").eq("user_id", user.id).limit(1).execute()
    if cres.data:
        client = cres.data[0]
    else:
        ins = sb.table("clients").insert({
            "user_id": user.id,
            "name": metadata.get("company_name") or (email.split("@")[0] if email else "user"),
            "email": email,
        }).execute()
        if not ins.data:
            raise HTTPException(status_code=500, detail="Could not create tenant client")
        client = ins.data[0]

    return {
        "id": user.id,
        "email": email,
        "client_id": client["id"],
        "company_name": metadata.get("company_name"),
        "first_name": metadata.get("first_name"),
        "last_name": metadata.get("last_name"),
        "is_active": True,
        "is_verified": user.email_confirmed_at is not None,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
