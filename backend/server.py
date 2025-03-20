import os
import cv2
import shutil
import pytesseract
import torch
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
FRAME_FOLDER = "frames"
ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAME_FOLDER, exist_ok=True)

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load a better topic classification model
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("facebook/bart-large-mnli")

def extract_text_from_images(frame_folder):
    extracted_texts = []
    for img_file in sorted(os.listdir(frame_folder)):
        img_path = os.path.join(frame_folder, img_file)
        text = pytesseract.image_to_string(Image.open(img_path))
        text = text.strip()

        if text and text not in extracted_texts:
            extracted_texts.append(text)

        if len(extracted_texts) >= 5:  # Limit to 5 key texts
            break

    return extracted_texts

def classify_topic(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    scores = torch.softmax(outputs.logits, dim=1).tolist()[0]
    labels = ["Web Development", "Programming", "Data Science", "AI", "Math", "Other"]
    topic = labels[scores.index(max(scores))]
    return topic

@app.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    # Clear previous frames
    shutil.rmtree(FRAME_FOLDER)
    os.makedirs(FRAME_FOLDER, exist_ok=True)

    video = request.files["video"]
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    video.save(video_path)

    cap = cv2.VideoCapture(video_path)
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % 30 == 0:  # Process every 30th frame
            frame_filename = f"frame_{frame_count}.png"
            frame_path = os.path.join(FRAME_FOLDER, frame_filename)
            cv2.imwrite(frame_path, frame)
        frame_count += 1

    cap.release()

    extracted_texts = extract_text_from_images(FRAME_FOLDER)
    combined_text = " ".join(extracted_texts[:3])  # Use first 3 extracted texts
    topic = classify_topic(combined_text)

    response = {
        "extracted_text": extracted_texts[:2],  # Show only 2 lines
        "topic": topic,
        "difficulty": "Hard" if topic in ["AI", "Math", "Data Science"] else "Medium",
        "credits": 5 if topic in ["AI", "Math", "Data Science"] else 3,
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
