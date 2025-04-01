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
|   |── README.md
|   ├── auth-service
|   └── expense-service
│       ├── app
|       |   ├── __init__.py
|       |   ├── main.py
|       |   └── models.py
│       ├── test
|       |   └── test_main.py
|       |── .python-version
|       |── generate_token.py
|       └── requirements.txt
├── docs
|   ├── architecture.md
|   ├── mongondb_setup_summary.md
|   ├── README.md
|   └── requirements.md
├── .gitignore
├── makefile
└── README.md
```
