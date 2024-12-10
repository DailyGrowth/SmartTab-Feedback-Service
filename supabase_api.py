import os
import uuid
import logging
from datetime import datetime
from functools import wraps

import httpx
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv('secrets.env')

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('SmartTabFeedbackAPI')

# Configuration
class Config:
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SECRET_KEY = os.getenv('SMARTTAB_API_SECRET', str(uuid.uuid4()))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# Initialize FastAPI App
app = FastAPI(
    title="SmartTab Feedback Service",
    description="Feedback and usage stats collection for SmartTab Chrome Extension",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Feedback(BaseModel):
    extension_id: str
    feedback: str
    timestamp: datetime

class UsageStats(BaseModel):
    extension_id: str
    stats: dict
    timestamp: datetime

# Authentication Decorator
def require_api_key(f):
    async def decorated_function(*args, **kwargs):
        # Implement your API key validation logic here
        return await f(*args, **kwargs)
    return decorated_function

# Supabase Client
async def submit_to_supabase(collection: str, data: dict):
    async with httpx.AsyncClient() as client:
        headers = {
            "apikey": Config.SUPABASE_KEY,
            "Authorization": f"Bearer {Config.SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        response = await client.post(
            f"{Config.SUPABASE_URL}/rest/v1/{collection}",
            headers=headers,
            json=data
        )
        
        return response

# API Endpoints
@app.post("/feedback")
@require_api_key
async def submit_feedback(feedback: Feedback):
    try:
        response = await submit_to_supabase('feedback', {
            "extension_id": feedback.extension_id,
            "feedback": feedback.feedback,
            "timestamp": feedback.timestamp.isoformat(),
            "processed": False,
            "sentiment": None
        })
        
        response.raise_for_status()
        logger.info(f"Feedback received from {feedback.extension_id}")
        
        return {"status": "success", "message": "Feedback received"}
    
    except Exception as e:
        logger.error(f"Feedback submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/usage-stats")
@require_api_key
async def submit_usage_stats(stats: UsageStats):
    try:
        response = await submit_to_supabase('usage_stats', {
            "extension_id": stats.extension_id,
            "stats": stats.stats,
            "timestamp": stats.timestamp.isoformat()
        })
        
        response.raise_for_status()
        logger.info(f"Usage stats received from {stats.extension_id}")
        
        return {"status": "success", "message": "Usage stats received"}
    
    except Exception as e:
        logger.error(f"Usage stats submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.getenv('PORT', 8000))
    )
