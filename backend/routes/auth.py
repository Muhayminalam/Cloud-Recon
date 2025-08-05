from fastapi import APIRouter, HTTPException, status, Depends
from models import UserCreate, UserLogin, User, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user_id
from db import get_users_collection, is_mongodb_connected
from datetime import datetime
import uuid
from pymongo.errors import DuplicateKeyError, ConnectionFailure

router = APIRouter()

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check MongoDB connection
    if not is_mongodb_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is temporarily unavailable"
        )
    
    try:
        users_collection = get_users_collection()
    except ConnectionFailure:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    
    # Check if user already exists
    try:
        if users_collection.find_one({"email": user_data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    except Exception as e:
        print(f"Database error during user lookup: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service error"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "_id": str(uuid.uuid4()),
        "email": user_data.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    try:
        users_collection.insert_one(user_doc)
        return {"message": "User registered successfully", "email": user_data.email}
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        print(f"Database error during user registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to register user"
        )

@router.post("/login", response_model=Token)
async def login_user(user_data: UserLogin):
    """Login user and return JWT token"""
    # Check MongoDB connection
    if not is_mongodb_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is temporarily unavailable"
        )
    
    try:
        users_collection = get_users_collection()
    except ConnectionFailure:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    
    # Find user by email
    try:
        user_doc = users_collection.find_one({"email": user_data.email})
    except Exception as e:
        print(f"Database error during user lookup: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service error"
        )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    try:
        access_token = create_access_token(data={"sub": user_doc["_id"]})
    except Exception as e:
        print(f"Error creating access token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create access token"
        )
    
    # Create user object for response
    user = User(
        _id=user_doc["_id"],
        email=user_doc["email"],
        created_at=user_doc["created_at"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me", response_model=User)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user profile"""
    # Check MongoDB connection
    if not is_mongodb_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is temporarily unavailable"
        )
    
    try:
        users_collection = get_users_collection()
    except ConnectionFailure:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed"
        )
    
    try:
        user_doc = users_collection.find_one({"_id": user_id})
    except Exception as e:
        print(f"Database error during user lookup: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service error"
        )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        _id=user_doc["_id"],
        email=user_doc["email"],
        created_at=user_doc["created_at"]
    )