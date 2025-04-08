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
|   |   |   └── test_main.py
|   |   └── README.md
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
|   ├── requirements.txt
|   └── ruff.toml
├── docs
|   ├── architecture.md
|   ├── mongondb_setup_summary.md
|   ├── README.md
|   └── requirements.md
├── .gitignore
├── makefile
└── README.md
```
