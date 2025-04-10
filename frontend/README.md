# Frontend

This is the frontend for Expense Tracker v2, built with React and Vite. It provides a simple UI for users to log in, add expenses, and view their expense list, interacting with the `auth-service` and `expense-service` backend APIs.

## Tech Stack

- **Framework**: React
- **Bundler**: Vite
- **HTTP Client**: Axios
- **Styling**: Plain CSS
- **Dependencies**: Managed via `package.json`

### Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx  # Login UI
│   │   ├── ExpenseForm.jsx  # Expense creation UI
│   │   └── ExpenseList.jsx  # Expense display UI
│   ├── App.jsx  # Main app component
│   └── main.jsx  # Entry point
├── package.json  # Dependencies and scripts
├── vite.config.js  # Vite configuration
└── README.md  # This file
```

## Setup Instructions

### 1. Prerequisites

