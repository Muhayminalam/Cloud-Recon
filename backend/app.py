from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, scan, payload, logs, cve, pcap
from db import is_mongodb_connected
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Force redeploy - updated 2025-08-05 at 6:40 PM
# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RedRecon API",
    description="Secure Red Team Simulation Platform",
    version="1.0.0"
)

# CORS Configuration - TEMPORARY: Allow all origins for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TEMPORARY: Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(scan.router, prefix="/api", tags=["Scanning"])
app.include_router(payload.router, prefix="/api", tags=["Payloads"])
app.include_router(logs.router, prefix="/api", tags=["Logs"])
app.include_router(cve.router, prefix="/api", tags=["CVE"])
app.include_router(pcap.router, prefix="/api", tags=["PCAP"])

# Root route for health/info
@app.get("/")
async def root():
    return {"message": "RedRecon API is running", "version": "1.0.0"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}

# DEBUG ENDPOINT - Remove after fixing MongoDB
@app.get("/debug")
async def debug_info():
    """Debug endpoint to check what's actually running"""
    mongo_uri = os.getenv("MONGO_URI")
    jwt_secret = os.getenv("JWT_SECRET_KEY")
    
    return {
        "mongodb_connected": is_mongodb_connected(),
        "mongo_uri_present": bool(mongo_uri),
        "mongo_uri_starts_with": mongo_uri[:50] if mongo_uri else None,
        "jwt_secret_present": bool(jwt_secret),
        "db_module_loaded": "db" in sys.modules,
        "timestamp": datetime.utcnow().isoformat(),
        "environment_vars": {
            "MONGO_URI": "SET" if mongo_uri else "MISSING",
            "JWT_SECRET_KEY": "SET" if jwt_secret else "MISSING",
            "PYTHONPATH": os.getenv("PYTHONPATH", "NOT_SET")
        }
    }

# Local dev server entrypoint (ignored on Azure)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)