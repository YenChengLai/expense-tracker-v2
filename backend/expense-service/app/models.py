from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: datetime
    description: Optional[str] = None
    type: str  # "expense" or "income"
    currency: Optional[str] = "TWD"


class ExpenseResponse(BaseModel):
    _id: str
    userId: str
    groupId: Optional[str] = None
    amount: float
    category: str
    date: datetime
    description: Optional[str] = None
    type: str
    epoch: int

    class Config:
        from_attributes = True  # Allows conversion from MongoDB docs
