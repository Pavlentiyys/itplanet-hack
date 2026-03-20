from pydantic import BaseModel, EmailStr


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str


class TokenData(BaseModel):
    id: int


class RegistrationRequest(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    password: str
    avatar_url: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
