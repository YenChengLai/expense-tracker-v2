import time
from typing import Annotated, List

from bson import ObjectId
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase

from .auth import TokenData, get_current_user
from .db import get_db
from .models import Category, ExpenseCreate, ExpenseResponse


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
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> ExpenseResponse:
    expense_dict = expense.model_dump()
    expense_dict["userId"] = current_user.userId
    expense_dict["groupId"] = None
    expense_dict["epoch"] = int(time.time())
    result = await db.expense.insert_one(expense_dict)
    expense_dict["_id"] = str(result.inserted_id)
    expense_dict["userId"] = str(expense_dict["userId"])
    return ExpenseResponse(**expense_dict)


@app.get("/expense")
async def get_expenses(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> list[ExpenseResponse]:
    expenses = await db.expense.find({"userId": current_user.userId}).to_list(None)
    return [ExpenseResponse(**{**exp, "_id": str(exp["_id"]), "userId": str(exp["userId"])}) for exp in expenses]


@app.post("/categories")
async def create_category(
    category: Category,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> Category:
    existing = await db.category.find_one({"name": category.name, "userId": current_user.userId})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists for this user")
    await db.category.insert_one({"name": category.name, "userId": current_user.userId})
    return category


@app.get("/categories")
async def list_categories(
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> List[str]:
    user_categories = await db.category.distinct("name", {"userId": current_user.userId})
    universal_categories = await db.category.distinct("name", {"userId": None})
    return list(set(user_categories + universal_categories))


@app.put("/categories/{name}")
async def update_category(
    name: str,
    category: Category,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> Category:
    existing = await db.category.find_one({"name": name, "userId": current_user.userId})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found or not owned by user")
    if await db.category.find_one({"name": category.name, "userId": current_user.userId}):
        raise HTTPException(status_code=400, detail="New category name already exists")
    await db.category.update_one({"name": name, "userId": current_user.userId}, {"$set": {"name": category.name}})
    await db.expense.update_many(
        {"category": name, "userId": current_user.userId}, {"$set": {"category": category.name}}
    )
    return category


@app.delete("/categories/{name}")
async def delete_category(
    name: str,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> dict[str, str]:
    existing = await db.category.find_one({"name": name, "userId": current_user.userId})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found or not owned by user")
    if await db.expense.find_one({"category": name, "userId": current_user.userId}):
        raise HTTPException(status_code=400, detail="Cannot delete category used in records")
    await db.category.delete_one({"name": name, "userId": current_user.userId})
    return {"message": "Category deleted successfully"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "Expense service is up"}
