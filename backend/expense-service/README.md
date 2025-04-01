# Expense Service

This is the `expense-service` component of the Expense Tracker v2 backend, built with FastAPI. It provides RESTful APIs for managing expense data, using MongoDB as the database. This service is part of a microservices architecture within the `expense-tracker-v2` monorepo, with authentication currently handled locally (to be moved to `auth-service` in the future).

## Tech Stack

- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Database**: MongoDB (local instance, with plans to migrate to MongoDB Atlas)
- **Dependencies**: Managed via `backend/requirements.txt` (shared with other services)

## Prerequisites

Before setting up `expense-service`, ensure you have the following installed:

- **Python**: Version 3.11 or higher (`python3 --version` to check).
- **MongoDB**: Community Edition installed locally (`mongod --version` to check). See [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/) for instructions.
- **pip**: Python package manager (usually bundled with Python).
- **Git**: For cloning or working within the monorepo (optional if you’re already in `expense-tracker-v2/`).

## Setup Instructions

Follow these steps to set up and run the backend locally.

### 1. Navigate to the Backend Directory

From your working directory, ensure you’re in the `expense-tracker-v2/` root:

```bash
cd expense-tracker-v2
```

### 2. Activate the Shared Virtual Environment

The virtual environment is located at backend/venv/ and shared across services:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

If the `venv` doesn't exist yet:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the MongoDB Server

Ensure MongoDB is running locally:

```bash
mongod --dbpath ~/mongodb-data  # Create ~/mongodb-data if it doesn’t exist
```

- On Windows, start it via the MongoDB service or installer.
- Verify it’s running by connecting with mongosh (mongodb://localhost:27017) or MongoDB Compass

### 4. Start the MongoDB Server

```bash
mongod --dbpath ~/mongodb-data  # Create ~/mongodb-data if it doesn’t exist
```

- On Windows, you may need to start it via the MongoDB service or installer.
- Verify it’s running by connecting with a tool like MongoDB Compass (mongodb://localhost:27017).

### 5. Run the Expense Service

Navigate to the `expense-service` directory and start the FastAPI server:

```bash
cd expense-service
uvicorn app.main:app --reload --port <port_number>
```

- `pp.main:app` refers to the FastAPI app instance in `app/main.py`.
- `--reload`: Enables auto-reloading for development.
- `--port 8000`: Runs the service on the port specified. e.g. <http://127.0.0.1:8001>.

### 6. Verify It's Working

#### Generate a Test Token

Authentication is currently local. Generate a JWT token for testing:

```bash
cd expense-tracker-v2/backend/expense-service
python generate_token.py "<data counts in group collection>"
```

#### Copy the output token (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`).

Test the Endpoints

- POST /expense: Add a new expense:

```bash
curl -X POST "http://127.0.0.1:8001/expense" \
-H "Authorization: Bearer <your-token>" \
-H "Content-Type: application/json" \
-d '{"amount": 50.00, "category": "Groceries", "date": "2025-03-15T10:00:00Z", "description": "Weekly shopping", "type": "expense", "currency": "USD"}'
```

Expected response:

```json
{
  "_id": "some-object-id",
  "userId": "user-object-id",
  "groupId": null,
  "amount": 50.0,
  "category": "Groceries",
  "date": "2025-03-15T10:00:00Z",
  "description": "Weekly shopping",
  "type": "expense",
  "currency": "USD",
  "epoch": 1741832400
}
```
