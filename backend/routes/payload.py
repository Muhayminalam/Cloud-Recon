from fastapi import APIRouter, Depends
from models import PayloadRequest, PayloadResult
from auth import get_current_user_id
from db import get_logs_collection
from utils.fake_data import generate_fake_payload_response
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/payload", response_model=PayloadResult)
async def test_payload(payload_request: PayloadRequest, user_id: str = Depends(get_current_user_id)):
    """Test a payload against a target URL"""
    
    # Generate fake payload testing results
    response_data = generate_fake_payload_response(
        payload_request.payload_type.value,
        payload_request.payload,
        payload_request.target_url
    )
    
    # Create result object
    result = PayloadResult(
        payload_type=payload_request.payload_type.value,
        target_url=payload_request.target_url,
        payload=payload_request.payload,
        success=response_data.get("vulnerability_detected", False),
        response=response_data,
        timestamp=datetime.utcnow()
    )
    
    # Log the payload test
    logs_collection = get_logs_collection()
    log_entry = {
        "_id": str(uuid.uuid4()),
        "user_id": user_id,
        "tool": "payload",
        "input_data": f"{payload_request.payload_type.value}: {payload_request.target_url}",
        "result": result.dict(),
        "timestamp": datetime.utcnow()
    }
    logs_collection.insert_one(log_entry)
    
    return result