from app.main import BEARER
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = BEARER


class UserResponse(BaseModel):
    email: str
    userId: str
