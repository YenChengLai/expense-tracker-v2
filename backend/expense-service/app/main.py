from typing import Annotated

from bson import ObjectId
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.database import Database

from .auth import TokenData, get_current_user
from .db import get_db
from .models import ExpenseCreate, ExpenseResponse


app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/expense")
async def create_expense(
    expense: ExpenseCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Database, Depends(get_db)],
) -> ExpenseResponse:
    expense_dict = expense.dict()
    expense_dict["userId"] = current_user["userId"]
    expense_dict["groupId"] = None
    expense_dict["epoch"] = int(expense.date.timestamp())
    expense_dict["_id"] = str(ObjectId())
    db.expense.insert_one(expense_dict)
    return ExpenseResponse(**expense_dict)


@app.get("/expense")
async def get_expenses(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    db: Annotated[Database, Depends(get_db)],
) -> list[ExpenseResponse]:
    expenses = db.expense.find({"userId": current_user.userId})
    return [ExpenseResponse(**{**exp, "_id": str(exp["_id"]), "userId": str(exp["userId"])}) for exp in expenses]
