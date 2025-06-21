
import os
import subprocess
import cv2
import threading
from dotenv import load_dotenv

# --- Gemini AI imports ---
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set. Please set it in your environment variables.")

# Set your recording duration (in seconds)
duration = 10

# Output file in the same folder as this script
output_filename = os.path.join(os.path.dirname(__file__), "output.mp4")

# FFmpeg command (for Windows using DirectShow)
ffmpeg_cmd = [
    'ffmpeg',
    '-y',
    '-f', 'dshow',
    '-i', 'video=HP Truevision HD:audio=Microphone Array (2- Realtek High Definition Audio)',
    '-t', str(duration),
    '-b:v', '500k',
    output_filename
]

def preview_camera(duration):
    cap = cv2.VideoCapture(0)
    print("Preview started. Recording for", duration, "seconds...")
    frames = int(duration * 20)  # Assuming 20 FPS
    count = 0
    while cap.isOpened() and count < frames:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow('Live Preview (Recording...)', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        count += 1
    cap.release()
    cv2.destroyAllWindows()

def analyze_video_with_gemini(video_path, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    with open(video_path, "rb") as video_file:
        video_bytes = video_file.read()

    prompt = (
        "Analyze the mood of the person in this video. Describe their emotional state and any visible cues. What key events happened in the video and how many times does the person blink"
    )

    response = model.generate_content(
        [
            prompt,
            {
                "mime_type": "video/mp4",
                "data": video_bytes
            }
        ]
    )
    print("\nGemini AI analysis result:")
    print(response.text)

if __name__ == "__main__":
    # Start FFmpeg recording in a separate thread
    ffmpeg_thread = threading.Thread(target=lambda: subprocess.run(ffmpeg_cmd))
    ffmpeg_thread.start()

    # Start OpenCV preview (optional)
    preview_camera(duration)

    ffmpeg_thread.join()
    print(f"Recording complete. Saved as {output_filename}")

    # --- Gemini AI Analysis ---
    #   # <-- Replace with your actual API key
    analyze_video_with_gemini(output_filename, GEMINI_API_KEY)