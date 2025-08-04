from fastapi import APIRouter, Depends, HTTPException
from models import ScanRequest, ScanResult
from auth import get_current_user_id
from db import get_logs_collection
from utils.fake_data import generate_fake_nmap_scan
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/scan", response_model=ScanResult)
async def perform_scan(scan_request: ScanRequest, user_id: str = Depends(get_current_user_id)):
    """Perform a network scan on the target"""
    
    # Generate fake scan results
    scan_result = generate_fake_nmap_scan(scan_request.target)
    
    # Log the scan
    logs_collection = get_logs_collection()
    log_entry = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "tool": "scan",
        "input_data": scan_request.target,
        "result": scan_result,
        "timestamp": datetime.utcnow()
    }
    logs_collection.insert_one(log_entry)
    
    return ScanResult(**scan_result)