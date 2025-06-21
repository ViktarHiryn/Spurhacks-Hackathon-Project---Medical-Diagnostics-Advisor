import os
from dotenv import load_dotenv
import google.generativeai as genai


# Load environment variables from .env
load_dotenv()

# Get API key from .env
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini client
genai.configure(api_key=api_key)

# Create a model instance
model = genai.GenerativeModel('gemini-1.5-flash')

# Send a prompt
response = model.generate_content("I have a 100.1 degree fever what should I do")

# Print the result
print(response.text)