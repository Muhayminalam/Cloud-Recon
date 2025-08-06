from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Global variables for database connections
client = None
db = None
users_collection = None
logs_collection = None
cves_collection = None

def connect_to_mongodb():
    """Attempt to connect to MongoDB Atlas optimized for Azure"""
    global client, db, users_collection, logs_collection, cves_collection
    
    if not MONGO_URI:
        print("WARNING: MONGO_URI environment variable is not set")
        return False

    try:
        print(f"🔄 Connecting to MongoDB Atlas...")
        print(f"📍 Connection string starts with: {MONGO_URI[:50]}...")
        
        # Simplified connection for Azure - let MongoDB handle SSL automatically
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=30000,  # Increased timeout for Azure
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
            retryWrites=True,
            w='majority'
        )
        
        # Test the connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # Get database - using 'redrecon' (lowercase) to match connection string
        db = client.redrecon
        
        # Collections
        users_collection = db.users
        logs_collection = db.logs
        cves_collection = db.cves
        
        # Print database info for debugging
        print(f"📊 Connected to database: {db.name}")
        print(f"📋 Available collections will be created on first use")
        
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
    
    if db is None:  # ✅ Fixed: Use 'is None' instead of 'not db'
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return db

def get_users_collection():
    """Get users collection, attempt reconnect if needed"""
    global users_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if users_collection is None:  # ✅ Fixed: Use 'is None' instead of 'not users_collection'
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return users_collection

def get_logs_collection():
    """Get logs collection, attempt reconnect if needed"""
    global logs_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if logs_collection is None:  # ✅ Fixed: Use 'is None' instead of 'not logs_collection'
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return logs_collection

def get_cves_collection():
    """Get CVEs collection, attempt reconnect if needed"""
    global cves_collection, mongodb_connected
    
    if not mongodb_connected:
        print("🔄 Attempting to reconnect to MongoDB...")
        mongodb_connected = connect_to_mongodb()
    
    if cves_collection is None:  # ✅ Fixed: Use 'is None' instead of 'not cves_collection'
        raise ConnectionFailure("MongoDB is not connected. Please check your connection.")
    
    return cves_collection

def is_mongodb_connected():
    """Check if MongoDB is currently connected"""
    return mongodb_connected

def test_connection():
    """Test MongoDB connection and return status"""
    try:
        if client:
            client.admin.command('ping')
            return True, "Connection successful"
        else:
            return False, "No client connection"
    except Exception as e:
        return False, f"Connection test failed: {e}"