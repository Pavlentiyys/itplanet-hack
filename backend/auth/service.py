from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, update

from functions import expires_in_days, utc_now
from settings import Settings
from .schemas import TokenPair
from .models import RefreshToken
from .security import create_access_token, create_refresh_token, hash_token


async def new_user(db: AsyncSession, settings: Settings, user_id: int) -> TokenPair:
    existing_token = await db.scalar(select(RefreshToken).where(RefreshToken.user_id == user_id))
    if existing_token:
        raise HTTPException(status_code=400, detail="User already exists")
    
    data = {"sub": str(user_id)}
    access_token = create_access_token(data, settings)
    refresh_token = create_refresh_token()
    expires_at = expires_in_days(settings.refresh_token_expire_days)

    token_in_db = RefreshToken(user_id=user_id, token=hash_token(refresh_token), expires_at=expires_at)
    db.add(token_in_db)
    await db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


async def refresh_tokens(db: AsyncSession, settings: Settings, user_id: int) -> TokenPair:
    data = {"sub": str(user_id)}
    access_token = create_access_token(data, settings)
    refresh_token = create_refresh_token()
    expires_at = expires_in_days(settings.refresh_token_expire_days)

    await db.execute(update(RefreshToken).where(RefreshToken.user_id == user_id).values(token=hash_token(refresh_token), expires_at=expires_at))
    await db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_token)


async def try_to_refresh_token(db: AsyncSession, settings: Settings, refresh_token: str) -> TokenPair:
    statement = select(RefreshToken).where(RefreshToken.token == hash_token(refresh_token), RefreshToken.expires_at > utc_now())
    token_in_db = (await db.execute(statement)).scalar_one_or_none()
    if not token_in_db:
        raise HTTPException(status_code=400, detail="Invalid refresh token")
    
    token_pair = await refresh_tokens(db, settings, token_in_db.user_id)
    return token_pair
