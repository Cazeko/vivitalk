"""Auth via Supabase Auth (sign_up/sign_in_with_password)."""
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.database import get_admin_supabase
from app.core.security import get_current_user
from app.schemas.auth import Token, UserCreate, UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/signup", response_model=UserResponse)
async def signup(data: UserCreate):
    sb = get_admin_supabase()
    try:
        # Use admin create_user so users are auto-confirmed (skip email verify in dev)
        res = sb.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "company_name": data.company_name,
                "first_name": data.first_name,
                "last_name": data.last_name,
            },
        })
    except Exception as e:
        msg = str(e)
        if "already" in msg.lower() or "registered" in msg.lower():
            raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다")
        logger.error(f"signup failed: {e}")
        raise HTTPException(status_code=400, detail=f"회원가입 실패: {msg}")

    user = res.user
    if not user:
        raise HTTPException(status_code=400, detail="회원가입 실패")

    # Auto-create tenant client
    try:
        existing = sb.table("clients").select("id").eq("user_id", user.id).limit(1).execute()
        if not existing.data:
            sb.table("clients").insert({
                "user_id": user.id,
                "name": data.company_name or data.email.split("@")[0],
                "email": data.email,
            }).execute()
    except Exception as e:
        logger.warning(f"client autocreate: {e}")

    return UserResponse(
        id=user.id,
        email=user.email,
        company_name=data.company_name,
        first_name=data.first_name,
        last_name=data.last_name,
        is_active=True,
        is_verified=True,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    sb = get_admin_supabase()
    try:
        res = sb.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password,
        })
    except Exception as e:
        logger.warning(f"login error for {form_data.username}: {e}")
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    if not res.session or not res.user:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다")

    return Token(
        access_token=res.session.access_token,
        token_type="bearer",
        expires_in=res.session.expires_in or settings.JWT_EXPIRATION_MINUTES * 60,
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "로그아웃 되었습니다"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        company_name=current_user.get("company_name"),
        first_name=current_user.get("first_name"),
        last_name=current_user.get("last_name"),
        is_active=current_user.get("is_active", True),
        is_verified=current_user.get("is_verified", False),
        created_at=current_user.get("created_at"),
        updated_at=current_user.get("updated_at"),
    )
