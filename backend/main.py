from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
import logging
import tempfile
import json
from collections import defaultdict
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
import certifi

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Medical AI Chat Backend", version="1.0.0")

#connect to mongoDB


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

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Initialize MongoDB client
try:
    client = MongoClient(MONGODB_URL,tlsCAFile=certifi.where())
    print("mongsadfafodb", client.admin.command('ping'))
    database = client[DATABASE_NAME]
    history_collection = database[COLLECTION_NAME]
    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")
    # Query for a movie that has the title 'Back to the Future'
    query = { "runtime": 14 }
    movie = movies.find_one(query)
    print(movie)
    # client.close()
    logger.info("MongoDB connection initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB: {e}")
    # Don't raise here, allow app to start without MongoDB for now
    mongodb_client = None
    database = None
    history_collection = None

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

class ChatMessage(BaseModel):
    type: str  # "user" or "ai"
    content: str
    timestamp: str
    isVideo: Optional[bool] = False
    isVideoAnalysis: Optional[bool] = False

class ChatHistoryRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: Optional[str] = None

class DiagnosisData(BaseModel):
    diagnosis: str
    date: str
    duration: str
    symptoms: List[str]
    confidence: float
    followUpNeeded: bool
    aiRecommendations: List[str]
    visionData: Dict[str, Any]
    voiceAnalysis: Dict[str, Any]

class AddHistoryRequest(BaseModel):
    diagnosis: DiagnosisData

class ChatHistoryResponse(BaseModel):
    diagnoses: List[DiagnosisData]
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
        
        # Extract all document analyses
        document_analyses = [
            msg.content for msg in chat_histories[request.user_id]
            if msg.content.startswith("[Document Analysis]")
        ]

        document_context = ""
        if document_analyses:
            document_context = (
                "==== Document Analyses ====\n"
                + "\n".join(document_analyses)
                + "\n==== End of Document Analyses ====\n\n"
            )

        # Build conversation history
        history_context = ""
        for msg in chat_histories[request.user_id][-10:]:
            role = "Patient" if msg.type == "user" else "AI Doctor"
            history_context += f"{role}: {msg.content}\n"

        # Extract key facts from chat history
        key_facts = [
            msg.content for msg in chat_histories[request.user_id]
            if msg.content.startswith("[Key Fact]")
        ]

        key_facts_context = ""
        if key_facts:
            key_facts_context = (
                "Important facts from previous documents:\n"
                + "\n".join(key_facts)
                + "\n\n"
            )

        medical_prompt = f"""
        {document_context}
        {key_facts_context}
        Conversation so far:
        {history_context}

        Patient Question: {request.message}

        Instructions:
        - Use any document analyses above to inform your answer.
        - Also use the conversation so far.
        - Be clear if you are referencing information from a document.
        - If you need more information, ask the user for clarification.

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
        
        # When user sends a message:
        now = datetime.utcnow().isoformat()
        chat_histories[request.user_id].append(ChatMessage(
            type="user",
            content=request.message,
            timestamp=now,
        ))
        # When Gemini responds:
        chat_histories[request.user_id].append(ChatMessage(
            type="ai",
            content=response.text,
            timestamp=now,
        ))
        
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

class DeleteDocumentRequest(BaseModel):
    document_id: str

@app.delete("/api/history/{document_id}")
def delete_history_entry(document_id: str):
    """
    Delete a medical history entry from MongoDB
    """
    try:
        if history_collection is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Validate ObjectId format
        try:
            object_id = ObjectId(document_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid document ID format")
        
        # Delete the document
        result = history_collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 1:
            logger.info(f"Successfully deleted document: {document_id}")
            return {
                "success": True,
                "message": "Medical history entry deleted successfully",
                "deleted_id": document_id
            }
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Add diagnosis to history endpoint
@app.post("/api/history/add")
def add_to_history(request: AddHistoryRequest):
    """
    Add a diagnosis to the medical history in MongoDB
    """
    diagnosis = request.diagnosis
    print("flippodpapsiidai", diagnosis)

    try:
        if history_collection is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Convert diagnosis to dict and add metadata
        diagnosis_dict = diagnosis.model_dump()
        diagnosis_dict["created_at"] = datetime.now()
        diagnosis_dict["updated_at"] = datetime.now()
        print("diagnosis_dict", diagnosis_dict)
        
        # Insert into MongoDB
        result = history_collection.insert_one(diagnosis_dict)
        
        if result.inserted_id:
            logger.info(f"Successfully added diagnosis to history: {result.inserted_id}")
            return {
                "success": True,
                "message": "Diagnosis added to medical history successfully",
                "id": str(result.inserted_id)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save diagnosis to database")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding diagnosis to history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Get medical history endpoint
@app.get("/api/history")
def get_medical_history(user_id: Optional[str] = None, limit: int = 50):
    """
    Get medical history from MongoDB
    """
    try:
        if history_collection is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        # Get documents sorted by creation date (newest first)
        cursor = history_collection.find(query).sort("created_at", -1).limit(limit)
        
        # Convert to list
        history_list = []
        for document in cursor:
            # Convert ObjectId to string
            document["_id"] = str(document["_id"])
            history_list.append(document)
        
        return {
            "success": True,
            "history": history_list,
            "count": len(history_list)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving medical history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Chat history analysis endpoint
@app.post("/api/chat/analyze-history", response_model=ChatHistoryResponse)
async def analyze_chat_history(request: ChatHistoryRequest):
    """
    Analyze chat history to extract medical diagnoses and create structured medical records
    """
    try:
        print("asdsadasdads", request.messages)
        logger.info(f"Received chat history analysis request with {len(request.messages)} messages")
        
        if len(request.messages) < 2:
            raise HTTPException(status_code=400, detail="Not enough chat history to analyze")
        
        # Format chat history for analysis
        chat_text = ""
        for msg in request.messages:
            role = "Patient" if msg.type == "user" else "AI Doctor"
            if msg.isVideo:
                chat_text += f"{role}: [Video message] {msg.content}\n"
            elif msg.isVideoAnalysis:
                chat_text += f"{role}: [Video Analysis] {msg.content}\n"
            else:
                chat_text += f"{role}: {msg.content}\n"
        
        # Create analysis prompt
        analysis_prompt = f"""
        Analyze the following medical chat conversation and extract structured diagnosis information. 
        
        Chat History:
        {chat_text}
        
        Please analyze this conversation and return a JSON array containing one object for each distinct medical diagnosis or health concern discussed. Each diagnosis object should have this exact structure:
        
        {{
            "diagnosis": "Name of the condition/diagnosis",
            "date": "Current date in MM/DD/YYYY format",
            "duration": "Estimated consultation duration (e.g., '15 minutes')",
            "symptoms": ["symptom1", "symptom2", "symptom3"],
            "confidence": 0.85,
            "followUpNeeded": true/false,
            "aiRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
            "visionData": {{
                "blinkRate": 18,
                "eyeMovement": "Normal/Abnormal description",
                "facialExpression": "Description of expression"
            }},
            "voiceAnalysis": {{
                "tone": "Description of tone",
                "pace": "Description of pace", 
                "clarity": "Description of clarity"
            }},
        }}
        
        Guidelines:
        - Only create diagnoses for actual medical conditions discussed
        - Extract symptoms mentioned by the patient
        - Base recommendations on the AI doctor's advice given
        - Set confidence based on how certain the diagnosis seems (0.0 to 1.0)
        - Set followUpNeeded to true if serious symptoms or ongoing monitoring needed
        - For visionData and voiceAnalysis, use realistic medical values or "Normal" if not specifically discussed
        - Estimate documents and tasksGenerated based on conversation complexity
        - If no clear diagnoses, return empty array []
        
        Return ONLY the JSON array, no other text or formatting.
        """
        print("asdsadasdads", analysis_prompt)
        
        # Generate analysis using Gemini
        logger.info("Sending chat history to Gemini for analysis...")
        response = model.generate_content(analysis_prompt)
        
        if not response.text:
            print("Empty response from Gemini API")
            logger.error("Empty response from Gemini API")
            raise HTTPException(status_code=500, detail="Failed to generate analysis")
        
        # Parse JSON response
        try:
            print("asdsadasdads", response.text)
            # Clean the response text (remove any markdown formatting)
            json_text = response.text.strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
            json_text = json_text.strip()
            
            # Parse JSON
            diagnoses_data = json.loads(json_text)
            
            # Validate and convert to DiagnosisData objects
            diagnoses = []
            for diag_dict in diagnoses_data:
                try:
                    diagnosis = DiagnosisData(**diag_dict)
                    diagnoses.append(diagnosis)
                except Exception as validation_error:
                    logger.warning(f"Failed to validate diagnosis data: {validation_error}")
                    continue
            
            logger.info(f"Successfully extracted {len(diagnoses)} diagnoses from chat history")
            
            return ChatHistoryResponse(
                diagnoses=diagnoses,
                success=True
            )
            
        except json.JSONDecodeError as json_error:
            logger.error(f"Failed to parse JSON response: {json_error}")
            logger.error(f"Raw response: {response.text}")
            return ChatHistoryResponse(
                diagnoses=[],
                success=False,
                error=f"Failed to parse diagnosis data: {str(json_error)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat history analysis: {str(e)}")
        return ChatHistoryResponse(
            diagnoses=[],
            success=False,
            error=str(e)
        )

# Document analysis endpoint
@app.post("/api/document/analyze", response_model=ChatResponse)
async def analyze_document(document: UploadFile = File(...), user_id: str = Form(default="default")):
    """
    Analyze uploaded document (e.g., PDF, DOCX) using Gemini API for health-related insights
    """
    try:
        logger.info(f"Received document analysis request. File: {document.filename}, Size: {document.size}")
        
        # Validate file type
        if not document.content_type in ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            raise HTTPException(status_code=400, detail="File must be a PDF or DOCX document")
        
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        if document.size and document.size > max_size:
            raise HTTPException(status_code=400, detail="Document file too large (max 10MB)")
        
        # Create temporary file to store the document
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            # Read document content and write to temp file
            document_content = await document.read()
            temp_file.write(document_content)
            temp_file_path = temp_file.name
        
        try:
            # Upload document file to Gemini
            logger.info("Uploading document to Gemini API...")
            document_file = genai.upload_file(temp_file_path)
            
            # Wait for processing to complete
            logger.info("Waiting for document processing...")
            import time
            while document_file.state.name == "PROCESSING":
                time.sleep(2)
                document_file = genai.get_file(document_file.name)
            
            if document_file.state.name == "FAILED":
                raise HTTPException(status_code=500, detail="Document processing failed")
            
            # Create the medical analysis prompt
            medical_prompt = f"""
            Please analyze this document from a medical/health perspective. Look for:
            
            1. **Medical History**: Any relevant past medical history, surgeries, or treatments
            2. **Current Medications**: List of current medications and dosages
            3. **Allergies**: Any known allergies or adverse reactions
            4. **Symptoms**: Description of any current symptoms or health concerns
            5. **Lifestyle Factors**: Information on diet, exercise, alcohol, tobacco use, etc.
            
            User's specific request: Extract health insights from this document.
            
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
                document_file,
                medical_prompt
            ])
            
            if not response.text:
                raise HTTPException(status_code=500, detail="Failed to generate document analysis")

            logger.info("Document analysis completed successfully")
            
            # After generating the summary in /api/document/analyze:
            now = datetime.utcnow().isoformat()
            chat_histories[user_id].append(ChatMessage(
                type="ai",
                content=f"[Document Analysis] {response.text}",
                timestamp=now,
            ))
            
            # After getting response.text (the summary)
            key_facts_prompt = f"""
            Extract the 3-5 most important facts, findings, or recommendations from the following medical document summary. 
            Format each as a single, clear sentence.

            Summary:
            {response.text}
            """

            key_facts_response = model.generate_content(key_facts_prompt)
            key_facts = [fact.strip() for fact in key_facts_response.text.split('\n') if fact.strip()]
            
            now = datetime.utcnow().isoformat()
            for fact in key_facts:
                chat_histories[user_id].append(ChatMessage(
                    type="ai",
                    content=f"[Key Fact] {fact}",
                    timestamp=now,
                ))
            
            return ChatResponse(
                response=response.text,
                success=True
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
        logger.error(f"Error in document analysis: {str(e)}")
        return ChatResponse(
            response=f"Error: {str(e)}",
            success=False,
            error=str(e)
        )

# In-memory storage for chat histories
chat_histories = defaultdict(list)  # user_id -> List[ChatMessage]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
