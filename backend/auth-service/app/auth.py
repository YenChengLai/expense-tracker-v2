from fastapi import HTTPException
from jose import jwt, JWTError
import bcrypt
from .models import UserResponse

SECRET_KEY = "your-secret-key"  # Shared with expense-service for now
ALGORITHM = "HS256"

# Function to verify password by comparing the hashed password with the plain password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Function to create JWT access token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Function to authenticate user by checking email and password
def authenticate_user(email: str, password: str, db) -> UserResponse:
    user = db.user.find_one({"email": email})
    if not user or not verify_password(password, user["hashedPassword"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserResponse(email=user["email"], userId=str(user["_id"]))

# Function to verify the JWT token and retrieve user info
def verify_token(token: str, db) -> UserResponse:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.user.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return UserResponse(email=email, userId=str(user["_id"]))
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate token")