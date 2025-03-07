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
