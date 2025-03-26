import os
import cv2
import pytesseract
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import random

app = Flask(__name__)
CORS(app)

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Define folders
UPLOAD_FOLDER = "uploads"
FRAME_FOLDER = "frames"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAME_FOLDER, exist_ok=True)

# Simple topic classification using keywords
TOPIC_KEYWORDS = {
    "Mathematics": ["algebra", "calculus", "geometry", "equation", "function"],
    "Programming": ["python", "code", "algorithm", "function", "variable"],
    "Physics": ["force", "motion", "energy", "velocity", "gravity"],
    "Biology": ["cell", "DNA", "organism", "evolution", "species"],
    "History": ["war", "empire", "kingdom", "revolution", "ancient"],
    "Business": ["finance", "market", "economy", "profit", "investment"]
}

# Delete old frames
def clear_frames():
    for file in os.listdir(FRAME_FOLDER):
        os.remove(os.path.join(FRAME_FOLDER, file))

# Extract relevant frames
def extract_frames(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_rate = int(cap.get(cv2.CAP_PROP_FPS))
    interval = frame_rate * 5  # Every 5 seconds

    frame_count = 0
    saved_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % interval == 0:
            frame_path = os.path.join(FRAME_FOLDER, f"frame_{saved_count}.jpg")
            cv2.imwrite(frame_path, frame)
            saved_count += 1

        frame_count += 1

    cap.release()
    return saved_count

# Extract key text from frames
def extract_text_from_images(folder):
    extracted_text = []
    previous_text = ""

    for img_file in sorted(os.listdir(folder)):
        img_path = os.path.join(folder, img_file)
        text = pytesseract.image_to_string(Image.open(img_path)).strip()

        if text and text != previous_text:
            extracted_text.append(text)
            previous_text = text

        if len(extracted_text) >= 10:  # Limit processing to 10 texts
            break

    return extracted_text

# Determine topic, difficulty, and credits
def analyze_text(text_data):
    if not text_data:
        return {"summary": "No readable text found.", "topic": "Unknown", "difficulty": "Unknown", "credits": 0}

    # Summarize: Just pick the first 2 extracted text blocks
    summary = " ".join(text_data[:2])

    # Detect topic using keyword matching
    detected_topic = "Unknown"
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(word.lower() in summary.lower() for word in keywords):
            detected_topic = topic
            break

    # Assign difficulty and credits
    difficulty_map = {"Easy": 5, "Medium": 10, "Hard": 15}
    difficulty = "Easy" if len(summary) < 100 else "Medium" if len(summary) < 300 else "Hard"
    credits = difficulty_map[difficulty]

    return {"summary": summary, "topic": detected_topic, "difficulty": difficulty, "credits": credits}

@app.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    video_file = request.files["video"]
    video_path = os.path.join(UPLOAD_FOLDER, video_file.filename)
    
    # Delete previous frames
    clear_frames()

    video_file.save(video_path)

    # Extract frames (optimized)
    extracted_frames = extract_frames(video_path)
    print(f"Extracted {extracted_frames} frames.")

    # Extract text and analyze
    text_data = extract_text_from_images(FRAME_FOLDER)
    report = analyze_text(text_data)

    # Delete frames after processing
    clear_frames()

    return jsonify({
        "message": "Processing completed!",
        "summary": report["summary"],
        "topic": report["topic"],
        "difficulty": report["difficulty"],
        "credits": report["credits"]
    })

if __name__ == "__main__":
    app.run(debug=True)
