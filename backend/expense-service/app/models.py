from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: str
    description: str | None = None
    type: str  # "expense" or "income"
    currency: str  # e.g., "USD", "EUR"


class ExpenseResponse(BaseModel):
    _id: str
    userId: str
    groupId: str | None = None
    amount: float
    category: str
    date: str
    description: str | None = None
    type: str
    currency: str
    epoch: int

    class Config:
        from_attributes = True  # Allows conversion from MongoDB docs
