# generate_hash.py
import sys

import bcrypt


def generate_hash(input_password: str) -> str:
    """Generate a bcrypt hash from a given password."""
    password_bytes = input_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


if __name__ == "__main__":
    # Check if a password was provided as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python3 generate_hash.py <password>")
        print("Example: python3 generate_hash.py 'mypassword'")
        sys.exit(1)

    # Get the password from the first argument
    password = sys.argv[1]
    hashed_str = generate_hash(password)
    print(hashed_str)  # e.g., "$2b$12$..."
