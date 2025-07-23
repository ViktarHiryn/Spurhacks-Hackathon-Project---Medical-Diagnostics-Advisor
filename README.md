# VitAI-Spurhacks Medical Advisor
![front_page](https://github.com/user-attachments/assets/72fda7d1-f8b5-4fc6-86a4-9b6b2f811d65)

VitAI is a web app for unofficial medical consultation. It uses a FastAPI backend in Python deployed on Render using Uvicorn. The backend connects to the React frontend which is deployed on Vercel via CORS. The app uses a Google Gemini API wrapper and stores potential diagnoses in a MongoDB database via PyMongo.  


# About

VitAI is centered on the medical chatbot which was tweaked to provide mecially inclined responses to potential issues. A disclaimer is shown to inform that the chatbot does not replace a professional medical service. 

Users can prompt the chatbot through text and video recording, the latter of which uses Gemini's video parsing endpoint to analyze the video. Any potential diagnoses detected in the users query are stored in the **medical history** tab which gives users the option to add to a database for later use. This feature was not fully developed and currently stores all medical history in one table as a simple proof of concept for MongoDB.

Users can also add and track current medications in the **medications** tab. Lastly, users have the ability to upload a PDF medical report and extract important information. 

# Usage

You can visit the web app at this [link](https://vitai-spurhacks-deploy.vercel.app/)
