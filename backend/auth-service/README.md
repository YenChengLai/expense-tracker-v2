# Auth Service

This is the `auth-service` component of the Expense Tracker v2 backend, built with FastAPI. It handles user authentication and token verification for the monorepo’s microservices.

## Tech Stack

- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Database**: MongoDB (local instance)
- **Dependencies**: Managed via `backend/requirements.txt`

## Setup Instructions

### 1. Activate the Shared Virtual Environment

```bash
cd expense-tracker-v2/backend
source venv/bin/activate
```

### 2. Run the Auth Service

```bash
cd auth-service
uvicorn app.main:app --reload --port 8002
```

### 3.  Verify It's Working

Health Check: curl <http://127.0.0.1:8002/health> → {"status": "Auth service is up"}
Login: See testing steps in [expense-service](../expense-service/README.md).
