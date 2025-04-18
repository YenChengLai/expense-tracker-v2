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
