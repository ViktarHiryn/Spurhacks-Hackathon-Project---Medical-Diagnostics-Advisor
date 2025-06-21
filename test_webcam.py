# # import cv2

# # # 1. Open a connection to the webcam (0 is usually the default camera)
# # cap = cv2.VideoCapture(0)

# # # 2. Define the codec and create VideoWriter object
# # fourcc = cv2.VideoWriter_fourcc(*'XVID')  # Codec: XVID is widely supported
# # out = cv2.VideoWriter('output.avi', fourcc, 20.0, (640, 480))  # filename, codec, FPS, resolution

# # # 3. Start capturing frames
# # print("Recording started. Press 'q' to stop.")
# # while cap.isOpened():
# #     ret, frame = cap.read()
# #     if not ret:
# #         break

# #     # Write the frame to the output file
# #     out.write(frame)

# #     # Optionally display the frame while recording
# #     cv2.imshow('Recording...', frame)

# #     # Break the loop when 'q' is pressed
# #     if cv2.waitKey(1) & 0xFF == ord('q'):
# #         break

# # # 4. Release everything when done
# # cap.release()
# # out.release()
# # cv2.destroyAllWindows()
# # print("Recording finished. Saved as 'output.avi'")

# import subprocess

# # Set your recording duration (in seconds)
# duration = 10

# # FFmpeg command (for Windows using DirectShow)
# cmd = [
#     'ffmpeg',
#     '-f', 'dshow',
#     '-i', 'video=HP Truevision HD:audio=Stereo Mix (2- Realtek High Definition Audio)',
#     '-t', str(duration),
#     'output.mp4'
# ]

# print("Recording video with audio for", duration, "seconds...")
# subprocess.run(cmd)
# print("Recording complete. Saved as output.mp4")
import os
import subprocess
import cv2
import threading

# Set your recording duration (in seconds)
duration = 10

# Output file in the same folder as this script
output_filename = os.path.join(os.path.dirname(__file__), "output.mp4")

# FFmpeg command (for Windows using DirectShow)
ffmpeg_cmd = [
    'ffmpeg',
    '-y',
    '-f', 'dshow',
    '-i', 'video=HP Truevision HD:audio=Stereo Mix (2- Realtek High Definition Audio)',
    '-t', str(duration),
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

# Start FFmpeg recording in a separate thread
ffmpeg_thread = threading.Thread(target=lambda: subprocess.run(ffmpeg_cmd))
ffmpeg_thread.start()

# Start OpenCV preview (optional)
preview_camera(duration)

ffmpeg_thread.join()
print(f"Recording complete. Saved as {output_filename}")