# MongoDB Setup Summary

This document summarizes the process of setting up a local MongoDB instance for the Expense Tracker project, as detailed in `mongodb_setup.md`. It outlines the key steps to install, configure, and integrate MongoDB with the FastAPI backend, based on the data model in `requirements.md`.

## Prerequisites

- **OS**: macOS, Ubuntu, or Windows.
- **Tools**: Terminal access and ~1 GB free disk space.
- **Software**: MongoDB Community Edition (installed locally).

## Setup Process

1. **Install MongoDB**:
   - **macOS**: Use Homebrew (`brew install mongodb-community`).
   - **Ubuntu**: Add MongoDB repo and install (`sudo apt install mongodb-org`).
   - **Windows**: Download and run the `.msi` installer from [MongoDB](https://www.mongodb.com/try/download/community).
   - Verify: `mongod --version`.

2. **Start the Server**:
   - **macOS**: Run `mongod --dbpath ~/mongodb-data` (create `~/mongodb-data` first).
   - **Ubuntu**: Start service with `sudo systemctl start mongod`.
   - **Windows**: Start via Services or `mongod --dbpath C:\data\db` (create `C:\data\db`).
   - Default port: `27017`.

3. **Initialize the Database**:
   - Open shell: `mongosh`.
   - Switch to database: `use expense_tracker`.
   - Create MVP collections:
     - `user`: Insert a sample user (email, hashedPassword, name, createdAt, deletedAt, groupId).
     - `group`: Insert a sample group (name, users, createdAt, deletedAt, owner).

        ```bash
        db.user.insertOne({
            "email": "<test@gmail.com>",
            "hashedPassword": "123456",
            "name": "Donald Trump",
            "createdAt": new Date().getTime() * 1000,
            "deletedAt": null,
            "groupId": null
        })

        db.group.insertOne({
            "name": "MAGA",
            "users": [ObjectId("67d2478e5592b0e4146b140c")],
            "createdAt": new Date().getTime() * 1000,
            "deletedAt": null
        })
        ```

   - Verify: `show collections`, `db.user.find()`, `db.group.find()`.

4. **Integrate with FastAPI**:
   - Update `backend/app/main.py` with:

     ```python
     from pymongo import MongoClient
     client = MongoClient("mongodb://localhost:27017/")
     db = client["expense_tracker"]
     ```
