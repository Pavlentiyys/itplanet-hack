from fastapi.security import OAuth2PasswordBearer
import jwt
from pwdlib import PasswordHash
import secrets
from hashlib import sha256

from settings import Settings
from functions import expires_in_minutes


password_hasher = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login",
    refreshUrl="auth/refresh"
)


def verify_password(plain_password, hashed_password) -> bool:
    return password_hasher.verify(plain_password, hashed_password)


def get_password_hash(password) -> str:
    return password_hasher.hash(password)


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def create_access_token(data: dict, settings: Settings) -> str:
    to_encode = data.copy()
    expire = expires_in_minutes(settings.access_token_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_refresh_token() -> str:
    return secrets.token_urlsafe(64)
