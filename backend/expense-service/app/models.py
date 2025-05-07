from typing import ClassVar

from bson import ObjectId
from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: str
    description: str | None = None
    type: str  # "expense" or "income"
    currency: str  # e.g., "USD", "EUR"


class Category(BaseModel):
    name: str


class Expense(BaseModel):
    id: str
    userId: str
    groupId: str | None
    amount: float
    category: str
    date: str
    description: str | None
    type: str
    currency: str
    epoch: int

    class Config:
        json_encoders: ClassVar[dict] = {ObjectId: str}
