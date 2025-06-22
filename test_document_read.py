import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set. Please set it in your environment variables.")

def chat_about_pdf(pdf_path, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')

    with open(pdf_path, "rb") as pdf_file:
        pdf_bytes = pdf_file.read()

    prompt = (
        "Analyze the attached medical report PDF. Summarize the key findings, highlight any abnormalities, and provide a brief explanation suitable for a patient."
    )

    # Start chat session with a goofy message
    chat = model.start_chat()
    hello_response = chat.send_message("Hi Gemini! Get ready for a medical report.")

    # Now send the PDF and prompt as the next message
    pdf_response = chat.send_message([
        prompt,
        {
            "mime_type": "application/pdf",
            "data": pdf_bytes
        }
    ])

    if hasattr(pdf_response, "text") and pdf_response.text:
        print("\nGemini AI analysis result:")
        print(pdf_response.text)
    else:
        print("\nNo response received from Gemini AI. Please check the PDF and try again.")
        return

    # Chat loop for follow-up questions
    while True:
        user_input = input("\nAsk a follow-up question (or type 'exit' to quit): ")
        if user_input.strip().lower() == "exit":
            print("Conversation ended.")
            break
        followup = chat.send_message(user_input)
        if hasattr(followup, "text") and followup.text:
            print("\nGemini AI response:")
            print(followup.text)
        else:
            print("\nNo response received for your question.")

if __name__ == "__main__":
    chat_about_pdf("sample_report.pdf", GEMINI_API_KEY)

