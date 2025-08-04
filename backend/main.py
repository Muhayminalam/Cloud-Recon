from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, scan, payload, logs, cve, pcap
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="RedRecon API",
    description="Secure Red Team Simulation Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://redrecon.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(scan.router, prefix="/api", tags=["Scanning"])
app.include_router(payload.router, prefix="/api", tags=["Payloads"])
app.include_router(logs.router, prefix="/api", tags=["Logs"])
app.include_router(cve.router, prefix="/api", tags=["CVE"])
app.include_router(pcap.router, prefix="/api", tags=["PCAP"])

@app.get("/")
async def root():
    return {"message": "RedRecon API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)