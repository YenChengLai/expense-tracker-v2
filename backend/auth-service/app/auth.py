import uuid
from datetime import datetime, timedelta

import bcrypt
from fastapi import HTTPException
from jose import JWTError, jwt
from pymongo.database import Database

from .models import PendingUser, UserResponse


SECRET_KEY = "your-secret-key"  # Shared with expense-service for now
ALGORITHM = "HS256"

# Hardcoded admin email for simplicity (replace with proper auth in production)
ADMIN_EMAIL = "admin@example.com"


# Function to verify password by comparing the hashed password with the plain password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# Function to create JWT access token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Function to authenticate user by checking email and password
def authenticate_user(email: str, password: str, db: Database) -> UserResponse:
    user = db.user.find_one({"email": email})
    if not user or not verify_password(password, user["hashedPassword"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserResponse(email=user["email"], userId=str(user["_id"]))


def verify_token(token: str, db: Database) -> UserResponse:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not isinstance(email, str):
            raise HTTPException(status_code=401, detail="Invalid token")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.user.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return UserResponse(email=email, userId=str(user["_id"]))
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Could not validate token") from exc


# Function to handle forgot password
def initiate_password_reset(email: str, db: Database) -> str:
    # Check if the email exists
    user = db.user.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    # Generate a reset token
    reset_token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour

    # Store the reset token in the database
    reset_entry = {"userId": str(user["_id"]), "resetToken": reset_token, "expiresAt": expires_at}
    db.password_resets.insert_one(reset_entry)

    # In a real app, send an email with the reset link
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    print(f"Password reset link (simulated): {reset_link}")
    return reset_link


async def create_pending_user(email: str, password: str, db: Database) -> PendingUser:
    # Check if email already exists in pending_users or user collections
    existing_pending = db.pending_users.find_one({"email": email})
    existing_user = db.user.find_one({"email": email})
    if existing_pending or existing_user:
        raise HTTPException(status_code=400, detail="Email already registered or pending approval")

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Create pending user
    user_id = str(uuid.uuid4())
    pending_user = {
        "email": email,
        "hashedPassword": hashed_password,
        "userId": user_id,
        "createdAt": datetime.utcnow(),
    }
    db.pending_users.insert_one(pending_user)

    return PendingUser(**pending_user)


async def get_pending_users(db: Database) -> list[PendingUser]:
    pending_users = db.pending_users.find().to_list(None)
    return [PendingUser(**user) for user in pending_users]


async def approve_user(user_id: str, approve: bool, db: Database) -> None:
    # Find the pending user
    pending_user = db.pending_users.find_one({"userId": user_id})
    if not pending_user:
        raise HTTPException(status_code=404, detail="Pending user not found")

    # Delete from pending_users
    db.pending_users.delete_one({"userId": user_id})

    # If approved, add to user collection
    if approve:
        user = {
            "email": pending_user["email"],
            "hashedPassword": pending_user["hashedPassword"],
            "userId": pending_user["userId"],
            "status": "active",
        }
        db.user.insert_one(user)
        print(f"User approved: {pending_user['email']}")
    else:
        print(f"User rejected: {pending_user['email']}")
