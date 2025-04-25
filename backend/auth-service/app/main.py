from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .auth import authenticate_user, create_access_token, initiate_password_reset, verify_token
from .db import get_db
from .models import BEARER, ForgotPasswordRequest, LoginRequest, TokenResponse, UserResponse


app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_db)) -> dict:
    user = authenticate_user(request.email, request.password, db)
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": BEARER}


@app.get("/verify-token")
async def verify_token_endpoint(token: str, db=Depends(get_db)) -> UserResponse:
    return verify_token(token, db)


@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db=Depends(get_db)) -> dict:
    try:
        initiate_password_reset(request.email, db)
        return {"message": "A password reset link has been sent to your email."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process request: {e!r}") from e


@app.get("/health")
async def health_check() -> dict:
    return {"status": "Auth service is up"}
