from pydantic import BaseModel, EmailStr
from datetime import datetime

BEARER = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = BEARER


class UserResponse(BaseModel):
    email: str
    userId: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    userId: str
    resetToken: str
    expiresAt: datetime


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class PendingUser(BaseModel):
    email: str
    hashedPassword: str
    userId: str
    createdAt: datetime


class UserApprovalRequest(BaseModel):
    userId: str
    approve: bool
