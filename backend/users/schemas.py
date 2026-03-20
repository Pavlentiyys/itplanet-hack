from enum import IntEnum
from pydantic import BaseModel, EmailStr


class UserRole(IntEnum):
    USER = 0
    VERIFIED = 1
    MODERATOR = 2
    SUPERUSER = 3


class UserSchema(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole
    avatar_url: str | None = None


class BasicUserSchema(BaseModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole
    avatar_url: str | None = None


class UpdateUserRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    avatar_url: str | None = None
