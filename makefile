# Makefile
start-auth:
    cd backend/auth-service && uvicorn app.main:app --port 8002 --reload
start-expense:
    cd backend/expense-service && uvicorn app.main:app --port 8001 --reload
start: start-auth start-expense