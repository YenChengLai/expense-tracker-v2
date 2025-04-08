from fastapi import Depends, FastAPI

from .auth import authenticate_user, create_access_token, verify_token
from .db import get_db
from .models import LoginRequest, TokenResponse, UserResponse


app = FastAPI()


@app.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    user = authenticate_user(request.email, request.password, db)
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/verify-token", response_model=UserResponse)
async def verify_token_endpoint(token: str, db=Depends(get_db)):
    return verify_token(token, db)


@app.get("/health")
async def health_check():
    return {"status": "Auth service is up"}
