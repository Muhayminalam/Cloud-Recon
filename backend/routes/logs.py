# Fixed logs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models import LogEntry
from auth import get_current_user_id
from db import get_logs_collection, is_mongodb_connected
import pymongo

router = APIRouter()

@router.get("/logs", response_model=List[LogEntry])
async def get_user_logs(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    tool: Optional[str] = Query(default=None)
):
    """Get logs for the current user"""
    if not is_mongodb_connected():
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        logs_collection = get_logs_collection()
        # Build query
        query = {"user_id": user_id}
        if tool:
            query["tool"] = tool
        
        # Get logs with pagination
        cursor = logs_collection.find(query).sort("timestamp", pymongo.DESCENDING).skip(offset).limit(limit)
        logs = list(cursor)
        
        return [LogEntry(**log) for log in logs]
    except Exception as e:
        print(f"Error fetching logs: {e}")
        raise HTTPException(status_code=503, detail="Database service error")

@router.get("/user-logs/{target_user_id}", response_model=List[LogEntry])
async def get_user_logs_admin(
    target_user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0)
):
    """Admin endpoint to get logs for any user (future implementation)"""
    # For now, only allow users to see their own logs
    if current_user_id != target_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not is_mongodb_connected():
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        logs_collection = get_logs_collection()
        cursor = logs_collection.find({"user_id": target_user_id}).sort("timestamp", pymongo.DESCENDING).skip(offset).limit(limit)
        logs = list(cursor)
        
        return [LogEntry(**log) for log in logs]
    except Exception as e:
        print(f"Error fetching user logs: {e}")
        raise HTTPException(status_code=503, detail="Database service error")

@router.delete("/logs/{log_id}")
async def delete_log(log_id: str, user_id: str = Depends(get_current_user_id)):
    """Delete a specific log entry"""
    if not is_mongodb_connected():
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        logs_collection = get_logs_collection()
        
        # Check if log belongs to user
        log = logs_collection.find_one({"_id": log_id, "user_id": user_id})
        if not log:
            raise HTTPException(status_code=404, detail="Log not found")
        
        # Delete the log
        result = logs_collection.delete_one({"_id": log_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Log not found")
        
        return {"message": "Log deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting log: {e}")
        raise HTTPException(status_code=503, detail="Database service error")