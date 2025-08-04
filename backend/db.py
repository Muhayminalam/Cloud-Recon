from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

try:
    client = MongoClient(MONGO_URI)
    # Test the connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas!")
    
    # Get database
    db = client.RedRecon
    
    # Collections
    users_collection = db.users
    logs_collection = db.logs
    cves_collection = db.cves
    
except ConnectionFailure as e:
    print(f"Failed to connect to MongoDB: {e}")
    raise

def get_database():
    return db

def get_users_collection():
    return users_collection

def get_logs_collection():
    return logs_collection

def get_cves_collection():
    return cves_collection