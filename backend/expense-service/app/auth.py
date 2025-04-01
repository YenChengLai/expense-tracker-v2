import requests

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

AUTH_SERVICE_URL = "http://127.0.0.1:8002/verify-token"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://127.0.0.1:8001/login")

class TokenData(BaseModel):
    email: str
    userId: str

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        response = requests.get(AUTH_SERVICE_URL, params={"token": token})
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(**response.json())
    except requests.RequestException:
        raise HTTPException(status_code=401, detail="Could not validate token")