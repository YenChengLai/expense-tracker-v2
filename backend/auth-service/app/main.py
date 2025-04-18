from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import authenticate_user, create_access_token, verify_token
from .db import get_db
from .models import BEARER, LoginRequest, TokenResponse, UserResponse


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


@app.get("/health")
async def health_check() -> dict:
    return {"status": "Auth service is up"}
