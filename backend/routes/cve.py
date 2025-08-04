from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from models import CVE
from auth import get_current_user_id
from db import get_cves_collection
from utils.fake_data import get_sample_cves
from datetime import datetime

router = APIRouter()

@router.get("/cves", response_model=List[CVE])
async def get_cves(
    user_id: str = Depends(get_current_user_id),
    severity: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    limit: int = Query(default=20, le=100)
):
    """Get CVE list with optional filtering"""
    cves_collection = get_cves_collection()
    
    # Check if we have CVEs in database, if not, populate with sample data
    if cves_collection.count_documents({}) == 0:
        sample_cves = get_sample_cves()
        for cve in sample_cves:
            cve["published_date"] = datetime.fromisoformat(cve["published_date"])
        cves_collection.insert_many(sample_cves)
    
    # Build query
    query = {}
    if severity:
        query["severity"] = severity
    if tag:
        query["tags"] = {"$in": [tag]}
    
    # Get CVEs
    cursor = cves_collection.find(query).limit(limit)
    cves = list(cursor)
    
    return [CVE(**cve) for cve in cves]

@router.get("/cves/{cve_id}", response_model=CVE)
async def get_cve_by_id(cve_id: str, user_id: str = Depends(get_current_user_id)):
    """Get specific CVE by ID"""
    cves_collection = get_cves_collection()
    
    cve = cves_collection.find_one({"_id": cve_id})
    if not cve:
        raise HTTPException(status_code=404, detail="CVE not found")
    
    return CVE(**cve)

@router.get("/cves/search/{search_term}", response_model=List[CVE])
async def search_cves(
    search_term: str,
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=20, le=100)
):
    """Search CVEs by description or tags"""
    cves_collection = get_cves_collection()
    
    # Text search in description and tags
    query = {
        "$or": [
            {"description": {"$regex": search_term, "$options": "i"}},
            {"tags": {"$in": [search_term.lower()]}}
        ]
    }
    
    cursor = cves_collection.find(query).limit(limit)
    cves = list(cursor)
    
    return [CVE(**cve) for cve in cves]