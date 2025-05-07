import time
from typing import Annotated

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
    expense_dict["id"] = str(result.inserted_id)
    expense_dict["userId"] = str(expense_dict["userId"])
    return ExpenseResponse(**expense_dict)


@app.get("/expense")
async def get_expenses(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> list[ExpenseResponse]:
    expenses = await db.expense.find({"userId": current_user.userId}).to_list(None)
    return [
        ExpenseResponse(
            id=str(exp["_id"]),
            userId=str(exp["userId"]),
            groupId=exp.get("groupId"),
            amount=exp["amount"],
            category=exp["category"],
            date=exp["date"],
            description=exp.get("description"),
            type=exp["type"],
            currency=exp["currency"],
            epoch=exp["epoch"],
        )
        for exp in expenses
    ]


@app.delete("/expense/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: Annotated[TokenData, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_db)],
) -> dict[str, str]:
    result = await db.expense.delete_one({"_id": ObjectId(expense_id), "userId": current_user.userId})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found or not owned by user")
    return {"message": "Expense deleted successfully"}


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
    show_universal: bool = False,
) -> list[dict]:
    try:
        # Fetch user-specific categories
        user_query = {"userId": current_user.userId}
        user_categories = await db.category.find(user_query).to_list(None)
        # Fetch universal categories if requested
        universal_categories = []
        if show_universal:
            universal_query = {"userId": {"$exists": False}}
            universal_categories = await db.category.find(universal_query).to_list(None)
        # Combine and format categories
        all_categories = user_categories + universal_categories
        return [{"name": cat["name"], "userId": str(cat.get("userId")) or None} for cat in all_categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {e!s}") from e


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


@app.get("/user")
async def get_user(current_user: Annotated[TokenData, Depends(get_current_user)]) -> dict[str, str]:
    try:
        return {"userId": str(current_user.userId)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {e!s}") from e


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "Expense service is up"}
