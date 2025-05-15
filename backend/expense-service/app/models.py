from typing import ClassVar

from bson import ObjectId
from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: str
    description: str | None = None
    type: str
    currency: str = "USD"


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


class UserProfile(BaseModel):
    userId: str
    email: str
    name: str | None = None
    image: str | None = None
    currency: str = "USD"
    dateFormat: str = "MM/DD/YYYY"
    updatedAt: int | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = None
    image: str | None = None
    currency: str | None = None
    dateFormat: str | None = None
