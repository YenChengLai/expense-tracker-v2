from pymongo import MongoClient  # Importing MongoClient from pymongo
from pymongo.database import Database  # Importing Database from pymongo


def get_db() -> Database:
    client: MongoClient = MongoClient("mongodb://localhost:27017/")
    return client["expense_tracker"]
