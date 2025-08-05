from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, scan, payload, logs, cve, pcap
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RedRecon API",
    description="Secure Red Team Simulation Platform",
    version="1.0.0"
)

# CORS Configuration - UPDATED to include the correct Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development frontend
        "https://redrecon.vercel.app",  # Original (keeping for compatibility)
        "https://red-recon.vercel.app"  # ADDED: Your actual Vercel URL with hyphen
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Any Vercel preview deployment
    allow_credentials=True,
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

# Local dev server entrypoint (ignored on Azure)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)