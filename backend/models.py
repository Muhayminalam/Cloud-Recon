from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    created_at: datetime

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ScanRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=255)

class ScanResult(BaseModel):
    target: str
    status: str
    ports: List[Dict[str, Any]]
    os_info: Dict[str, str]
    services: List[Dict[str, Any]]
    scan_time: datetime

class PayloadType(str, Enum):
    XSS = "xss"
    SQLI = "sqli"
    CSRF = "csrf"
    LFI = "lfi"
    RFI = "rfi"

class PayloadRequest(BaseModel):
    payload_type: PayloadType
    target_url: str = Field(..., min_length=1)
    payload: str = Field(..., min_length=1)

class PayloadResult(BaseModel):
    payload_type: str
    target_url: str
    payload: str
    success: bool
    response: Dict[str, Any]
    timestamp: datetime

class LogEntry(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    tool: str
    input_data: str
    result: Dict[str, Any]
    timestamp: datetime

    class Config:
        populate_by_name = True

class CVE(BaseModel):
    id: str = Field(alias="_id")
    description: str
    severity: str
    tags: List[str]
    reference: str
    published_date: datetime

    class Config:
        populate_by_name = True

class PCAPData(BaseModel):
    filename: str
    size: int
    packets: int
    protocol_breakdown: Dict[str, int]
    sample_data: str