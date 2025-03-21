from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from .models import ExpenseCreate, ExpenseResponse
from .auth import get_current_user
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    client = MongoClient("mongodb://localhost:27017/")
    app.state.db = client["expense_tracker"]


@app.post("/expense", response_model=ExpenseResponse)
async def create_expense(
    expense: ExpenseCreate, current_user: dict = Depends(get_current_user)
):
    expense_dict = expense.dict()
    expense_dict["userId"] = current_user["userId"]
    expense_dict["groupId"] = None
    expense_dict["epoch"] = int(expense.date.timestamp())
    expense_dict["_id"] = str(ObjectId())
    app.state.db.expense.insert_one(expense_dict)
    return ExpenseResponse(**expense_dict)


@app.get("/expense", response_model=list[ExpenseResponse])
async def get_expenses(current_user: dict = Depends(get_current_user)):
    expenses = app.state.db.expense.find({"userId": current_user["userId"]})
    return [
        ExpenseResponse(**{**exp, "_id": str(exp["_id"]), "userId": str(exp["userId"])})
        for exp in expenses
    ]
