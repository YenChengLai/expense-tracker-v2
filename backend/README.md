# Expense Tracker Backend

This is the backend service for the Expense Tracker application, built with FastAPI. It provides RESTful APIs for managing user authentication and expense data, using MongoDB as the database.

## Tech Stack

- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Database**: MongoDB (local instance, with plans to migrate to MongoDB Atlas)
- **Dependencies**: Managed via `requirements.txt`

## Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Python**: Version 3.11 or higher (`python3 --version` to check).
- **MongoDB**: Community Edition installed locally (`mongod --version` to check). See [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/) for instructions.
- **pip**: Python package manager (usually bundled with Python).
- **Git**: For cloning the repository (optional if you’re already in the monorepo).

## Setup Instructions

Follow these steps to set up and run the backend locally.

### 1. Navigate to the Backend Directory

From the root of the monorepo (`expense-tracker/`), move into the backend folder:

```bash
cd backend
```

### 2. Set Up a Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the MongoDB Server

```bash
mongod --dbpath ~/mongodb-data  # Create ~/mongodb-data if it doesn’t exist
```

- On Windows, you may need to start it via the MongoDB service or installer.
- Verify it’s running by connecting with a tool like MongoDB Compass (mongodb://localhost:27017).

### 5. Run the FastAPI Server

```bash
uvicorn app.main:app --reload
```

- app.main:app refers to the FastAPI app instance in app/main.py.
- reload enables auto-reloading for development (changes are reflected without restarting).

### 6. Verify It's Working

- Open your browser or a tool like Postman and visit <http://127.0.0.1:8000>. You should see:

```json
{"message": "Hello from FastAPI", "db": []}
```
