from fastapi import FastAPI
from pymongo import MongoClient

app = FastAPI()
client: MongoClient = MongoClient("mongodb://localhost:27017/")
db = client["expense_tracker"]


@app.get("/")
def root() -> dict:
    return {
        "message": "Hello from FastAPI",
        "users": db.user.count_documents({}),
        "groups": db.group.count_documents({}),
    }
