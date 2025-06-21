from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Optional
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Medical AI Chat Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not found in environment variables")
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
try:
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',  # Using flash for faster responses
        system_instruction="""You are a helpful medical AI assistant. 
        
        Guidelines:
        - Provide helpful and accurate medical information
        - Always remind users to consult with real healthcare professionals
        - Be empathetic and professional in your responses
        - If asked about serious symptoms, advise seeking immediate medical attention
        - Keep responses concise but informative
        
        Remember: You are an AI assistant and cannot replace professional medical diagnosis or treatment."""
    )
    logger.info("Gemini model initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini model: {e}")
    raise

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Medical AI Chat Backend is running"}

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        logger.info(f"Received chat request: {request.message[:50]}...")
        
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Prepare the prompt with medical context
        medical_prompt = f"""
        Patient Question: {request.message}
        
        Please provide a helpful medical response following these guidelines:
        1. Be informative but emphasize the importance of professional medical consultation
        2. If the question involves serious symptoms, recommend seeking immediate medical attention
        3. Provide general health information when appropriate
        4. Be empathetic and supportive
        
        Respond in a caring, professional manner as a medical AI assistant.
        """
        
        # Generate response using Gemini
        logger.info("Sending request to Gemini API...")
        response = model.generate_content(medical_prompt)
        
        if not response.text:
            logger.error("Empty response from Gemini API")
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        logger.info("Successfully generated response from Gemini")
        
        # Add medical disclaimer to response
        ai_response = response.text
        
        return ChatResponse(
            response=ai_response,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return ChatResponse(
            response="I'm sorry, I'm experiencing technical difficulties. Please try again later.",
            success=False,
            error=str(e)
        )

# Test endpoint for Gemini connection
@app.get("/api/test-gemini")
async def test_gemini():
    try:
        response = model.generate_content("Say 'Hello, I am your medical AI assistant!'")
        return {
            "success": True,
            "response": response.text,
            "message": "Gemini API connection successful"
        }
    except Exception as e:
        logger.error(f"Gemini API test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Gemini API connection failed"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
