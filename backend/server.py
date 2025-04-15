import os
import cv2
import pytesseract
import json
import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from google import genai

app = Flask(__name__)
CORS(app)

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Define folders
UPLOAD_FOLDER = "uploads"
FRAME_FOLDER = "frames"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAME_FOLDER, exist_ok=True)

# Configure Google AI client
client = genai.Client(api_key="AIzaSyDXpeE-cheNVGRdQR7H9U8cN9wF7lUzxtA")

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

        if len(extracted_text) >= 140:  # Limit processing to 10 texts
            break

    return extracted_text

def analyze_text(text_data):
    if not text_data:
        return {
            "summary": "No readable text found.",
            "topic": "Unknown",
            "difficulty": "0",
            "credits": "50"
        }
    
    summaryRes = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Make sure to not have any additional text than what is asked here: Summarize the following text in 2 lines: {text_data}"
    )
    summary = summaryRes.text

    topicRes = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Make sure to give properly with commas not numbers as output: Give me the relevant topics involved in this text, only topics that have a major impact in subject knowledge : {text_data}"
    )
    topic = topicRes.text

    difficultyRes = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Make sure to give only the number as output: Give me a difficulty level from 1 to 100 for an average human to learn the content of this course that this text is supposedly teaching: {text_data}"
    )
    difficulty = difficultyRes.text

    # Get similar topics from database (simulated here with Gemini)
    similarityRes = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"Make sure to give only a number from 0 to 100 as output representing the uniqueness of this content compared to existing courses. Higher number means more unique: Based on the topics {topic}, analyze how unique this content is: {text_data}"
    )
    uniqueness = int(similarityRes.text)

    # Calculate credits based on difficulty and uniqueness
    try:
        difficulty_score = int(difficulty)
        # Base credits between 50-500 based on difficulty
        base_credits = 50 + (difficulty_score * 4.5)  # This gives 50-500 range
        
        # Adjust credits based on uniqueness (can reduce up to 50% for very similar content)
        uniqueness_factor = (50 + uniqueness) / 100  # This gives 0.5-1.5 range
        final_credits = int(base_credits * uniqueness_factor)
        
        # Ensure credits stay within 50-500 range
        final_credits = max(50, min(500, final_credits))
    except:
        final_credits = 50  # Default if calculation fails

    return {
        "summary": summary,
        "topic": topic,
        "difficulty": difficulty,
        "credits": str(final_credits),
        "uniqueness": str(uniqueness)
    }

def process_video(video_path):
    # Create frames directory if it doesn't exist
    os.makedirs("frames", exist_ok=True)
    
    # Clear any existing frames
    clear_frames()

    # Extract frames from video
    extracted_frames = extract_frames(video_path)
    
    # Extract text from frames
    text_data = extract_text_from_images("frames")
    
    # Analyze the extracted text
    analysis = analyze_text(text_data)
    
    # Clean up frames
    clear_frames()
    
    return analysis

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
    parser = argparse.ArgumentParser()
    parser.add_argument('--analyze', type=str, help='Path to video file for analysis')
    args = parser.parse_args()

    if args.analyze:
        result = process_video(args.analyze)
        print(json.dumps(result))
    else:
        app.run(debug=True)
