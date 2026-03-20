from typing import Annotated

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from fastapi import Depends, HTTPException, status
import jwt
from jwt.exceptions import InvalidTokenError

from db import get_session
from settings import Settings, get_settings
from auth.security import oauth2_scheme, verify_password
from auth.schemas import TokenData
from users.models import User


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[AsyncSession, Depends(get_session)],
                     settings: Annotated[Settings, Depends(get_settings)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    user = (await db.execute(select(User).where(User.id == token_data.id))).scalar_one_or_none()
    return user


async def authenticate_user(db: Annotated[AsyncSession, Depends(get_session)], email: str, password: str) -> User | None:
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user
