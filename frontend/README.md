# Frontend

This is the frontend for Expense Tracker v2, built with React and Vite. It provides a simple UI for users to log in, add expenses, and view their expense list, interacting with the `auth-service` and `expense-service` backend APIs.

## Tech Stack

- **Framework**: React
- **Bundler**: Vite
- **HTTP Client**: Axios
- **Styling**: Plain CSS
- **Dependencies**: Managed via `package.json`

## Features

- **Login**: Authenticate users via `auth-service` and store JWT in `localStorage`.
- **Add Expense**: Submit new expenses to `expense-service` with authenticated requests.
- **View Expenses**: Display a table of the logged-in user’s expenses fetched from `expense-service`.
- **Logout**: Clear the token and return to the login screen.

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx  # Login UI
│   │   ├── ExpenseForm.jsx  # Expense creation UI
│   │   └── ExpenseList.jsx  # Expense display UI
│   ├── App.jsx  # Main app component
│   ├── main.jsx  # Entry point for React
│   └── index.css  # Entry point
├── package.json  # Dependencies and scripts
├── vite.config.js  # Vite configuration
└── README.md  # This file
```

## Setup Instructions

### 1. Prerequisites

- Node.js 20+:
  - Linux

  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  source ~/.bashrc  # or ~/.zshrc if using Zsh
  nvm install 20
  nvm use 20
  ```

  - macOS:

  ```bash
  brew install node@20
  ```

  or use `nvm` as above.

- Backend Services : Ensure `auth-service` and `expense-service` are both running.

  ```bash
  cd ../backend
  make start
  ```

### 2. Installation

- Navigate to Frontend Directory:

  ```bash
  cd ~/expense-tracker-v2/frontend
  ```

- Install Dependencies: All dependencies are defined in `package.json`. Instll with command:

  ```bash
  npm install
  ```

### 3. Running the Frontend

- Development Mode:

  ```bash
  npm run dev
  ```

  - Opens at `http://localhost:5173` in your browser.
  - Hot reloading is enabled for development.

- Build for Production:
  
  ```bash
  npm run build
  ```

  - Outputs to `dist/` folder.

- Preview Build (optional):

  ```bash
  npm run preview
  ```

  - Serves the built app locally for testing.

## Usage

### 1. Login

- Open `http://localhost:5173` [click here](http://localhost:5173).
- Enter credentials (e.g., `test@example.com` and `123456`) matching your `auth-service` MongoDB data.
- Submits to `POST http://127.0.0.1:8002/login`

### 2. Add Expense

- After logging in, fill out the expense form (amount, category, date, description).
- Submits to `POST http://127.0.0.1:8001/expense` with the JWT in the `Authorization` header.

### 3. View Expenses

- List all expenses for logged-in user, fetched from `GET http://127.0.0.1:8001/expense`.

### 4. Logout

- Click the "Logout" button to clear the token and return to the login screen.

## Development Notes

### 1. API Endpoints

- Login: POST <http://127.0.0.1:8002/login> (from `auth-service`)
- Create Expense: POST <http://127.0.0.1:8001/expense> (from `expense-service`)
- List Expenses: GET <http://127.0.0.1:8001/expense> (from `expense-service`)

### 2. CORS

- Configured in both `auth-service` and `expense-service` to allow <http://localhost:5173>.

### 3. Token Storage

- Uses `localStorage` to store the JWT for simplicity (MVP). Consider a more secure approach (e.g., HttpOnly cookies) for production.

### 4. Styling

- Uses plain CSS in `index.css` for a minimal, functional design. No external frameworks like Tailwind CSS are included.

## Troubleshooting

### CORS Errors

- Ensure `auth-service` and `expense-service` have CORS middleware set up with `allow-origins=["http://localhost:5173"]`
- Check browser console (press F12) for specific error details.

### Login Fails

- Verify `auth-service` is running and the user exists in MongoDB:

  ```bash
  curl -X POST "http://127.0.0.1:8002/login" -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "123456"}'
  ```

### Expense Operations Fail

- Confirm the JWT is valid and `expense-service` is running:
  
  ```bash
  curl "http://127.0.0.1:8001/expense" -H "Authorization: Bearer <your-token>"
  ```
