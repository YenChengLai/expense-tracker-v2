# Auth Service

This is the auth-service component of the Expense Tracker v2 backend, built with FastAPI. It handles user authentication (login with email/password) and token verification (JWT) for the monorepo’s microservices.

## Tech Stack

- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Database**: MongoDB (local instance)
- **Authentication**: JWT via `python-jose`, password hashing with `bcrypt`
- **Dependencies**: Managed via `backend/requirements.txt`

## Setup Instructions

### 1. Prerequisites

- Python 3.12+:
  - Linux: Install via package manager (e.g., `sudo apt-get install python3.12`) or `pyenv`:

    ```bash
    curl https://pyenv.run | bash
    pyenv install 3.12.2
    pyenv global 3.12.2
    ```

  - macOS: Use Homebrew or `pyenv`:

    ```bash
    brew install python@3.12
    # OR with pyenv
    brew install pyenv
    pyenv install 3.12.2
    pyenv global 3.12.2
    ```

- MongoDB: Install and run a local MongoDB instance:
  - Linux: install and start

    ```bash
    sudo apt-get install mongodb  # Ubuntu/Debian
    sudo systemctl start mongodb  # Start the service
    mongosh  # Verify with: show dbs
    ```
  
  - macOS: Install via Homebrew and start:

    ```bash
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
    mongosh  # Verify with: show dbs
    ```

- Git: Clone the monorepo if not already done:
  - Linux/macOS:

    ```bash
    git clone <repo-url>
    cd expense-tracker-v2
    ```

### 2. Set Up the Shared Virtual Environment

The backend services share a virtual environment located at `backend/venv/` .

- Create the Virtual Environment (if not already set up):
  - Linux/macOS:

    ```bash
    cd expense-tracker-v2/backend
    python3 -m venv venv  # Use python3 explicitly on macOS if python is Python 2
    source venv/bin/activate
    ```

- Install Dependencies:
  - Linux/macOS:

    ```bash
    pip install -r requirements.txt
    ```

### 3. Configure MongoDB

- Database: The service uses a local MongoDB instance (`mongodb://localhost:27017`).
- Initial User: Add a test user to the `expense_tracker` database:
  - Linux/macOS:

    ```bash
    mongosh
    use expense_tracker
    db.user.insertOne({
    "email": "test@example.com",
    "hashedPassword": "$2b$12$gMLXIaKlt2EzJfLnDDY6au4ttQ8nsRTzAd0qFKQ.G908neRVQns7y"  // Hash for 123456
    })
    ```

### 4. Run the Auth Service

- Linux/macOS:
  
  ```bash
  cd auth-service
  uvicorn app.main:app --reload --port 8002
  ```
  
  - `--reload`: Auto-restarts on code changes (development only).
  - `--port 8002`: Avoids conflicts with other services (e.g., `expense-service` on 8001)

### 5. Verify It's Working

- Health Check:
  - Linux/macOS:

  ```bash
  curl http://127.0.0.1:8002/health
  # Expected: {"status": "Auth service is up"}
  ```

- Login:
  - Linux/macOS:

  ```bash
  curl -X POST "http://127.0.0.1:8002/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "<test@example.com>", "password": "123456"}'
  # Expected: {"access_token": "...", "token_type": "bearer"}
  ```
  
## Development Notes

### Common Issues

- MongoDB Not Running:
  - Error: `pymongo.errors.ServerSelectionTimeoutError` .
  - Fix:
    - Linux: `sudo systemctl start mongodb`
    - macOS: `brew services start mongodb-community`
    - Verify: `mongosh --eval "db.runCommand({ping: 1})"`
- Path Resolution:
  - Imports like `from app.main import app` may fail in tests or IDEs.
  - Fix: Run from `backend/` with `pytest auth-service/test/` or configure your IDE (e.g., VS Code’s settings.json):

    ```json
    "python.analysis.extraPaths": ["${workspaceFolder}/backend/auth-service/app"]
    ```

- Dependency Conflicts:
  - If `pip install` fails, recreate the `venv`:
    - Linux/macOS:

      ```bash
      rm -rf venv
      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements.txt
      ```

- Virtual Environment Activation:
  - Manually running `source venv/bin/activate` can be tedious
  - Solution: Use `direnv`:
    - Linux: `sudo apt-get install direnv`
    - macOS: `brew install direnv`
    - Then:

      ```bash
      echo 'eval "$(direnv hook bash)"' >> ~/.bashrc  # or ~/.zshrc for Zsh
      source ~/.bashrc  # or ~/.zshrc
      cd backend
      echo "source venv/bin/activate" > .envrc
      direnv allow
      ```

### Project Structure

```text
auth-service/
├── app/
|   ├── __init__.py   # Mark library
│   ├── main.py       # FastAPI app and endpoints
│   ├── auth.py       # Authentication logic
│   ├── db.py         # MongoDB connection
│   └── models.py     # Pydantic models
└── test/
    └── test_auth_main.py  # Unit tests
```

### Testing

## Unit Tests

Test are in `test/test_auth_main.py` and use `pytest` with `TestClient` and mocking.

- Setup:
  - Ensure dependencies include testing tools:
    - Linux/macOS:

      ```bash
      pip install pytest pytest-asyncio requests
      ```

- Run Tests:
  - Linux/macOS:

    ```bash
    cd expense-tracker-v2/backend/auth-service
    pytest -v
    ```

    - Or from `backend/`:

      ```bash
      cd expense-tracker-v2/backend
      pytest auth-service/test/ -v
      ```

    - Excepted output:

      ```text
      test_auth_main.py::test_login_success PASSED
      test_auth_main.py::test_login_invalid_credentials PASSED
      test_auth_main.py::test_verify_token_success PASSED
      test_auth_main.py::test_verify_token_invalid PASSED
      test_auth_main.py::test_health_check PASSED
      ```

- Test Details:
  - Tests cover `/login`, `/verify-token`, and `/health`.
  - Uses mocks for MongoDB (`mock_databases`) and `get_db`.

- Configuration:
  - `pytest.ini` in `auth-service/` sets `asyncio_default_fixture_loop_scope=function` to avoid warnings.

## Manual Testing

- Verify Token:
  - Linux/macOS:

    ```bash
    curl --location 'http://127.0.0.1:8002/verify-token?token=<token>
    # Expected: {"email": "test@example.com", "userId": "..."}
    ```

  - Cross-Service: Test with `expense-service`. (Check its [README](../expense-service/README.md))
