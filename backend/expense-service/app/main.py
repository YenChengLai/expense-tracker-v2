import time
from typing import Annotated

from bson import ObjectId
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo.database import Database

from .auth import TokenData, get_current_user
from .db import get_db
from .models import CategoryCreate, ExpenseCreate, ExpenseResponse


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
    current_user: Annotated[TokenData, Depends(get_current_user)],
    db: Annotated[Database, Depends(get_db)],
) -> ExpenseResponse:
    expense_dict = expense.model_dump()  # Updated to model_dump
    expense_dict["userId"] = current_user.userId
    expense_dict["groupId"] = None
    expense_dict["epoch"] = int(time.time())
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


@app.post("/categories", response_model=CategoryCreate)
async def create_category(
    category: CategoryCreate,
    db: Annotated[Database, Depends(get_db)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> list[str]:
    existing = db.category.find_one({"name": category.name, "userId": ObjectId(current_user.userId)})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    db.category.insert_one({"name": category.name, "userId": ObjectId(current_user.userId)})
    return []


@app.get("/categories")
async def list_categories(db: Annotated[Database, Depends(get_db)]) -> list[str]:
    return db.category.find().distinct("name")


@app.get("/health")
async def health_check() -> dict:
    return {"status": "Expense service is up"}
