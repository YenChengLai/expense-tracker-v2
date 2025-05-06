import uuid
from datetime import datetime, timedelta

import bcrypt
from bson import ObjectId
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
    if user.get("deletedAt") is not None:
        raise HTTPException(status_code=401, detail="User is deleted")
    if not user.get("verified"):
        raise HTTPException(status_code=401, detail="Account not approved yet")
    role = "admin" if email == ADMIN_EMAIL else "user"
    return UserResponse(email=user["email"], userId=str(user["_id"]), role=role)


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
        role = "admin" if email == ADMIN_EMAIL else "user"
        return UserResponse(email=email, userId=str(user["_id"]), role=role)
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


def create_pending_user(email: str, password: str, db: Database) -> PendingUser:
    # Check if email already exists in pending_users or user collections
    existing_pending = db.user.find_one({"email": email})
    existing_user = db.user.find_one({"email": email})
    if existing_pending or existing_user:
        raise HTTPException(status_code=400, detail="Email already registered or pending approval")

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Create pending user
    pending_user = {
        "email": email,
        "hashedPassword": hashed_password,
        "createdAt": datetime.utcnow(),
        "deletedAt": None,
        "groupId": None,
        "verified": False,
    }
    result = db.user.insert_one(pending_user)
    pending_user["userId"] = str(result.inserted_id)
    return PendingUser(**pending_user)


def get_pending_users(db: Database) -> list[PendingUser]:
    pending_users = db.user.find({"verified": False}).to_list()
    return [PendingUser(**{**user, "userId": str(user["_id"])}) for user in pending_users]


def approve_user(user_id: str, approve: bool, db: Database) -> None:
    # Find the pending user
    pending_user = db.user.find_one({"_id": ObjectId(user_id), "verified": False})
    if not pending_user:
        raise HTTPException(status_code=404, detail="Pending user not found")

    # If approved, add to user collection
    if approve:
        # Mark as verified
        db.user.update_one({"_id": ObjectId(user_id)}, {"$set": {"verified": True}})
        print(f"User approved: {pending_user['email']}")
    else:
        # Delete from pending_users
        db.user.delete_one({"_id": ObjectId(user_id)})
        print(f"User rejected: {pending_user['email']}")
