# Requirements and Scope

## Core Features

- User authentication (email/password login, possibly OAuth later).
- Add and view expenses and incomes (amount, category, date).
- Monthly spending summary (total spent).
- Visualization with charts (post-MVP).
- Blur demonstration for non-login visitors.
- Settings for dynamic updates (categories, family members) (post-MVP).

## MVP Scope

- Basic email/password login with JWT.
- Add and view expenses (amount, category, date).
- Simple monthly summary (total spent).

## User Stories

- As a user, I want to log in with my email and password so I can access my expense data securely.
- As a user, I want to add a new expense so I can track my spending.
- As a user, I want to see a list of my expenses so I can review my spending.
- As a visitor, I can see a blurred version of the expense list and summary so I can understand the app’s value without accessing real data.
- As a visitor, I can view a static demo dashboard with sample data to get a feel for the app.

## Data Model

### Users Collection

- `email`: String
- `hashed_password`: String
- `name`: String
- `group_id`: ObjectId (post-MVP)

### Expenses Collection

- `user_id`: ObjectId
- `amount`: Number
- `category`: String
- `date`: Date
- `description`: String (optional)
- `type`: String (e.g., "expense" or "income")

### Category Collection (optional for MVP)

- `name`: String
- `type`: String

### Group Collection (post-MVP)

- `group_id`: ObjectId
- `group_name`: String
- `users`: Array of ObjectId
