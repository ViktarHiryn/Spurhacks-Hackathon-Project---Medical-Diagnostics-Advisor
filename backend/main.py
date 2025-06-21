from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Optional
import logging
import tempfile
import aiofiles

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
        model_name='gemini-2.5-flash',  # Using flash for faster responses
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

class VideoAnalysisResponse(BaseModel):
    analysis: str
    success: bool
    error: Optional[str] = None
    video_duration: Optional[float] = None
    file_size: Optional[int] = None

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
        
        return ChatResponse(
            response=response.text,
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

# Video analysis endpoint
@app.post("/api/video/analyze", response_model=VideoAnalysisResponse)
async def analyze_video(
    video: UploadFile = File(..., description="Video file to analyze"),
    prompt: str = Form(default="Analyze this video for health-related information, symptoms, or medical concerns. Provide a detailed analysis.")
):
    """
    Analyze uploaded video using Gemini API for health-related insights
    """
    try:
        logger.info(f"Received video analysis request. File: {video.filename}, Size: {video.size}")
        
        # Validate file type
        if not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Check file size (limit to 50MB)
        max_size = 50 * 1024 * 1024  # 50MB in bytes
        if video.size and video.size > max_size:
            raise HTTPException(status_code=400, detail="Video file too large (max 50MB)")
        
        # Create temporary file to store the video
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            # Read video content and write to temp file
            video_content = await video.read()
            temp_file.write(video_content)
            temp_file_path = temp_file.name
        
        try:
            # Upload video file to Gemini
            logger.info("Uploading video to Gemini API...")
            video_file = genai.upload_file(temp_file_path)
            
            # Wait for processing to complete
            logger.info("Waiting for video processing...")
            import time
            while video_file.state.name == "PROCESSING":
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
            
            if video_file.state.name == "FAILED":
                raise HTTPException(status_code=500, detail="Video processing failed")
            
            # Create the medical analysis prompt
            medical_prompt = f"""
            Please analyze this video from a medical/health perspective. Look for:
            
            1. **Physical Symptoms**: Any visible signs of discomfort, pain, unusual movements, or physical symptoms
            2. **Behavioral Indicators**: Changes in speech patterns, energy levels, mood, or behavior that might indicate health issues
            3. **Environmental Context**: Any relevant environmental factors that might affect health
            4. **General Observations**: Overall appearance, skin color, posture, breathing patterns, etc.
            
            User's specific request: {prompt}
            
            Important Guidelines:
            - Provide observations but emphasize that this is NOT a medical diagnosis
            - Recommend consulting healthcare professionals for any concerns
            - Be thorough but avoid causing unnecessary alarm
            - Focus on objective observations rather than definitive conclusions
            - If you see concerning symptoms, advise seeking medical attention
            
            Please provide a structured analysis with your observations and recommendations.
            """
            
            # Generate analysis using Gemini
            logger.info("Generating analysis with Gemini...")
            response = model.generate_content([
                video_file,
                medical_prompt
            ])
            
            if not response.text:
                raise HTTPException(status_code=500, detail="Failed to generate video analysis")

            logger.info("Video analysis completed successfully")
            
            return VideoAnalysisResponse(
                analysis=response.text,
                success=True,
                file_size=len(video_content)
            )
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
                logger.info("Temporary file cleaned up")
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up temp file: {cleanup_error}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in video analysis: {str(e)}")
        return VideoAnalysisResponse(
            analysis=f"I'm sorry, I encountered an error while analyzing your video: {str(e)}",
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
