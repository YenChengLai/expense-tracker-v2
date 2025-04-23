from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


def get_db() -> AsyncIOMotorDatabase:
    client: AsyncIOMotorClient = AsyncIOMotorClient("mongodb://localhost:27017/")
    return client["expense_tracker"]
