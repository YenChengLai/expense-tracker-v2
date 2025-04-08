# generate_hash.py
import bcrypt


password = "123456".encode("utf-8")
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
hashed_str = hashed.decode("utf-8")  # Convert bytes to string
print(hashed_str)  # e.g., "$2b$12$..."
