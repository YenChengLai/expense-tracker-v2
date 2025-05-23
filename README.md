# expense-tracker-v2

2nd version of the previous expense tracker. For previous version, please check: <https://github.com/YenChengLai/expense-tracker>

A personal/family expense tracker built with FastAPI, React, and MongoDB.

## Project Structure

- `backend/`: FastAPI backend
- `frontend/`: React frontend
- `docs/`: Documentation (requirements, etc.)

```plaintext
/expense-tracker
├── .vscode
|   └── settings.json
├── backend
|   ├── auth-service
|   |   ├── app
|   |   |   ├── __init__.py
|   |   |   ├── auth.py
|   |   |   ├── db.py
|   |   |   ├── main.py
|   |   |   └── models.py
│   |   ├── test
|   |   |   └── test_auth_main.py
|   |   ├── README.md
|   |   └── pytest.ini
|   ├── expense-service
│   |   ├── app
|   |   |   ├── __init__.py
|   |   |   ├── auth.py
|   |   |   ├── db.py
|   |   |   ├── main.py
|   |   |   └── models.py
│   |   ├── test
|   |   |   └── test_main.py
|   |   └── README.md
|   ├── .python-version
|   ├── generate_hash.py
|   ├── makefile
|   ├── requirements.txt
|   └── ruff.toml
├── docs
|   ├── architecture.md
|   ├── mongondb_setup_summary.md
|   ├── README.md
|   └── requirements.md
├── frontend
|   ├── public
|   |   ├── favicon.png
|   |   └── vite.svg
|   ├── src
|   |   ├── components
|   |   |   ├── AdminApproval.jsx
|   |   |   ├── Calendar.jsx
|   |   |   ├── Dashboard.jsx
|   |   |   ├── Expenses.jsx
|   |   |   ├── ForgotPassword.jsx
|   |   |   ├── Login.jsx
|   |   |   ├── Settings.jsx
|   |   |   ├── Sidebar.jsx
|   |   |   └── Signup.jsx
|   |   ├── App.jsx
|   |   ├── main.jsx
|   |   └── theme.js
|   ├── README.md
|   ├── eslint.config.js
|   ├── index.html
|   ├── package.json
|   ├── package-lock.json
|   ├── tsconfig.app.json
|   ├── tsconfig.json
|   ├── tsconfig.node.json
|   ├── vite.config.ts
|   └── requirements.md
├── .gitignore
└── README.md
```
