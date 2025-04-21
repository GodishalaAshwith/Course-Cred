import os
import cv2
import pytesseract
import json
import argparse
import numpy as np
import imagehash
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
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

def generate_video_fingerprint(video_path):
    """Generate a fingerprint for a video by sampling frames"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_points = np.linspace(0, total_frames - 1, 10, dtype=int)
    
    fingerprints = []
    for frame_idx in sample_points:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Convert to PIL Image
            pil_image = Image.fromarray(frame_rgb)
            # Generate hash
            hash = str(imagehash.average_hash(pil_image))
            fingerprints.append(hash)
    
    cap.release()
    return "_".join(fingerprints)

def calculate_video_similarity(fingerprint1, fingerprint2):
    """Calculate similarity between two video fingerprints"""
    if not fingerprint1 or not fingerprint2:
        return 0
    
    hashes1 = fingerprint1.split("_")
    hashes2 = fingerprint2.split("_")
    
    if len(hashes1) != len(hashes2):
        return 0
    
    # Calculate similarity for each frame hash
    similarities = []
    for h1, h2 in zip(hashes1, hashes2):
        hash1 = imagehash.hex_to_hash(h1)
        hash2 = imagehash.hex_to_hash(h2)
        similarity = 1 - (hash1 - hash2) / len(hash1.hash) ** 2
        similarities.append(similarity)
    
    # Return average similarity
    return sum(similarities) / len(similarities) * 100

def process_video(video_path, existing_videos_json=None):
    """Process video and check for duplicates"""
    try:
        # Generate fingerprint for new video
        new_fingerprint = generate_video_fingerprint(video_path)
        
        # Parse existing videos data if provided
        existing_videos = None
        current_user = None
        if existing_videos_json:
            try:
                data = json.loads(existing_videos_json)
                existing_videos = data.get('videos', [])
                current_user = data.get('current_user')
            except:
                existing_videos = []
        
        # Check for duplicates if existing videos are provided
        max_similarity = 0
        is_duplicate = False
        same_user_upload = False
        
        if existing_videos:
            for video in existing_videos:
                similarity = calculate_video_similarity(new_fingerprint, video.get('fingerprint', ''))
                if similarity > max_similarity:
                    max_similarity = similarity
                    # Consider it a duplicate if similarity is very high (>95%)
                    is_duplicate = similarity > 95
                    same_user_upload = video.get('owner') == current_user

        # Create frames directory if it doesn't exist
        os.makedirs("frames", exist_ok=True)
        
        # Clear any existing frames
        clear_frames()

        # Extract frames from video
        extracted_frames = extract_frames(video_path)
        
        # Extract text from frames
        text_data = extract_text_from_images("frames")
        
        # Get base analysis
        analysis = analyze_text(text_data)
        
        # Adjust credits based on similarity
        if is_duplicate:
            if same_user_upload:
                # Same user uploading duplicate gets no credits
                analysis['credits'] = '0'
                analysis['similarity_message'] = 'No credits awarded - duplicate video upload detected'
            else:
                # Different user uploading similar content gets reduced credits
                original_credits = int(analysis['credits'])
                reduced_credits = int(original_credits * (1 - (max_similarity / 100)))
                analysis['credits'] = str(max(0, reduced_credits))
                analysis['similarity_message'] = f'Credits reduced due to {max_similarity:.1f}% similarity with existing content'
        
        # Add fingerprint to analysis
        analysis['fingerprint'] = new_fingerprint
        analysis['similarity'] = max_similarity
        
        # Clean up frames only
        clear_frames()
        
        return analysis
    except Exception as e:
        print(f"Error in process_video: {e}")
        raise e

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
            "credits": "50",
            "fingerprint": "",
            "similarity": 0,
            "similarity_message": ""
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

@app.route("/upload", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    video_file = request.files["video"]
    video_path = os.path.join(UPLOAD_FOLDER, video_file.filename)
    
    # Get existing videos data from the request
    existing_videos = request.form.get('existing_videos', '[]')
    try:
        existing_videos = json.loads(existing_videos)
    except:
        existing_videos = []

    # Delete previous frames
    clear_frames()

    video_file.save(video_path)

    # Process video with duplicate detection
    report = process_video(video_path, existing_videos)

    # Delete frames after processing
    clear_frames()

    return jsonify({
        "message": "Processing completed!",
        "summary": report["summary"],
        "topic": report["topic"],
        "difficulty": report["difficulty"],
        "credits": report["credits"],
        "fingerprint": report["fingerprint"],
        "similarity": report["similarity"],
        "similarity_message": report.get("similarity_message", "")
    })

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--analyze', type=str, help='Path to video file for analysis')
    parser.add_argument('--existing-videos', type=str, help='JSON string containing existing videos data')
    args = parser.parse_args()

    if args.analyze:
        result = process_video(args.analyze, args.existing_videos)
        print(json.dumps(result))
    else:
        app.run(debug=True)
