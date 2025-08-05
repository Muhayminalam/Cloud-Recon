from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv
import ssl

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Global variables for database connections
client = None
db = None
users_collection = None
logs_collection = None
cves_collection = None

def connect_to_mongodb():
    """Attempt to connect to MongoDB Atlas with proper SSL handling"""
    global client, db, users_collection, logs_collection, cves_collection
    
    if not MONGO_URI:
        print("WARNING: MONGO_URI environment variable is not set")
        return False

    try:
        # MongoDB Atlas connection with SSL configuration for Azure
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=10000,  # 10 second timeout
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            ssl=True,
            ssl_cert_reqs=ssl.CERT_NONE,  # Disable SSL certificate verification for Azure
            ssl_match_hostname=False,
            tlsAllowInvalidCertificates=True
        )
        
        # Test the connection with a shorter timeout
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # Get database
        db = client.RedRecon
        
        # Collections
        users_collection = db.users
        logs_collection = db.logs
        cves_collection = db.cves
        
        return True
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("⚠️  WARNING: Application will start without database functionality")
        return False
    except Exception as e:
        print(f"❌ Unexpected error connecting to MongoDB: {e}")
        print("⚠️  WARNING: Application will start without database functionality")
        return False

# Try to connect on import, but don't crash if it fails
print("🔄 Attempting to connect to MongoDB Atlas...")
mongodb_connected = connect_to_mongodb()

def get_database():
    """Get database connection, attempt reconnect if needed"""
    global db, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if not db:
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return db

def get_users_collection():
    """Get users collection, attempt reconnect if needed"""
    global users_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if not users_collection:
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return users_collection

def get_logs_collection():
    """Get logs collection, attempt reconnect if needed"""
    global logs_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if not logs_collection:
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return logs_collection

def get_cves_collection():
    """Get CVEs collection, attempt reconnect if needed"""
    global cves_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if not cves_collection:
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return cves_collection

def is_mongodb_connected():
    """Check if MongoDB is currently connected"""
    return mongodb_connected