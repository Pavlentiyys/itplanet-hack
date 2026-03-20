from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from settings import Settings, get_settings
from common import authenticate_user
from .schemas import RegistrationRequest, TokenPair, RefreshRequest
from .service import new_user, refresh_tokens, try_to_refresh_token
from .security import get_password_hash

from users.service import create_user


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post("/register", response_model=TokenPair)
async def register(registration_request: RegistrationRequest, db: Annotated[AsyncSession, Depends(get_session)],
                   settings: Annotated[Settings, Depends(get_settings)]):
    email = registration_request.email
    first_name = registration_request.first_name
    last_name = registration_request.last_name
    password_hash = get_password_hash(registration_request.password)

    user = await create_user(db, email=email, first_name=first_name, last_name=last_name, password_hash=password_hash, avatar_url=registration_request.avatar_url)
    return await new_user(db, settings, user.id)


@router.post("/login", response_model=TokenPair)
async def login(login_request: Annotated[OAuth2PasswordRequestForm, Depends()], db: Annotated[AsyncSession, Depends(get_session)],
                settings: Annotated[Settings, Depends(get_settings)]):
    email = login_request.username
    password = login_request.password

    user = await authenticate_user(db, email, password)
    if user:
        token_pair = await refresh_tokens(db, settings, user.id)
        return token_pair
    
    else:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    

@router.post("/refresh", response_model=TokenPair)
async def refresh(refresh_request: RefreshRequest, db: Annotated[AsyncSession, Depends(get_session)], 
                  settings: Annotated[Settings, Depends(get_settings)]):
    token = refresh_request.refresh_token
    token_pair = await try_to_refresh_token(db, settings, token)
    return token_pair
