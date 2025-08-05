import os
from dotenv import load_dotenv

load_dotenv()

# Temporary: Disable MongoDB completely for testing
print("WARNING: MongoDB is disabled for testing. App will start without database functionality.")

# Mock database objects
client = None
db = None
users_collection = None
logs_collection = None
cves_collection = None

def get_database():
    raise Exception("Database is temporarily disabled")

def get_users_collection():
    raise Exception("Database is temporarily disabled")

def get_logs_collection():
    raise Exception("Database is temporarily disabled")

def get_cves_collection():
    raise Exception("Database is temporarily disabled")

def is_mongodb_connected():
    return False