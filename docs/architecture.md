# Architecture

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React
- **Database**: MongoDB (local instance, later MongoDB Atlas)
- **Authentication**: JWT (possibly OAuth later)

## High-Level Data Flow

1. User logs in via frontend.
2. Backend verifies credentials and issues a JWT.
3. Frontend sends authenticated requests to backend APIs.
4. Backend interacts with MongoDB to store/retrieve data.

(Diagram placeholder: Add a simple architecture diagram later.)
