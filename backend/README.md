# Medical AI Chat Backend

FastAPI backend with Gemini AI integration for medical chat functionality.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration (optional)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env` file

### 4. Run the Server

```bash
cd backend
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test the API

- Health check: `GET http://localhost:8000/`
- Test Gemini: `GET http://localhost:8000/api/test-gemini`
- Chat endpoint: `POST http://localhost:8000/api/chat`

## API Endpoints

### POST /api/chat

Send a message to the medical AI assistant.

**Request:**

```json
{
  "message": "I have a headache, what should I do?",
  "user_id": "optional_user_id"
}
```

**Response:**

```json
{
  "response": "AI response with medical advice...",
  "success": true,
  "error": null
}
```

### GET /api/test-gemini

Test the Gemini API connection.

**Response:**

```json
{
  "success": true,
  "response": "Hello, I am your medical AI assistant!",
  "message": "Gemini API connection successful"
}
```

## CORS Configuration

The backend is configured to accept requests from:

- http://localhost:3000 (React)
- http://localhost:5173 (Vite)
- http://127.0.0.1:3000
- http://127.0.0.1:5173

If your frontend runs on a different port, update the `allow_origins` list in `main.py`.

## Features

- Medical AI chat with Gemini 2.5 Flash
- CORS enabled for frontend integration
- Medical disclaimers automatically added
- Error handling and logging
- Pydantic models for request/response validation
