from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel

SECRET_KEY = "your-secret-key"  # Move to env vars later
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


class TokenData(BaseModel):
    email: str
    userId: str


def get_current_user(
    token: str = Depends(oauth2_scheme), db=Depends(lambda: app.state.db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.user.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return {"email": email, "userId": str(user["_id"])}
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
