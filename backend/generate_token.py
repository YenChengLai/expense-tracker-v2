from jose import jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

token = jwt.encode({"sub": "test@example.com"}, SECRET_KEY, algorithm=ALGORITHM)
print(token)