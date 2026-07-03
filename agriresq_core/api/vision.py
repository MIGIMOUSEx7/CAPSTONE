import joblib
import cv2
import numpy as np
import os
import base64

# We load this globally so it only loads once when the server starts
model_path = os.path.join(os.path.dirname(__file__), 'svm_vegetable_model.pkl')
try:
    svm_model = joblib.load(model_path)
except FileNotFoundError:
    raise FileNotFoundError(f"SVM Model not found at {model_path}. Did you run train_svm.py?")

def analyze_crop_image(image_bytes: bytes, crop_type: str = 'EGGPLANT') -> dict:
    """
    Performs SVM inference and uses OpenCV to draw a bounding box.
    """
    # 1. Convert bytes to NumPy array for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # Read in color so we can draw a colored box (Green/Red)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 
    
    # Create a grayscale copy for the SVM and contour detection
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # --- NEW: OBJECT DETECTION (Bounding Box) ---
    # Apply a blur and threshold to find the object against the background
    blurred = cv2.GaussianBlur(img_gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Find contours (the outlines of the vegetables)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # --- EXISTING SVM PREDICTION ---
    # Resize to 64x64 for the SVM
    img_resized = cv2.resize(img_gray, (64, 64))
    features = img_resized.flatten().reshape(1, -1)
    prediction = svm_model.predict(features)[0] 
    
    is_fresh = 'fresh' in prediction.lower()
    status = 'GREEN' if is_fresh else 'RED'
    
    # --- DRAW THE BOX ---
    box_color = (0, 255, 0) if is_fresh else (0, 0, 255) # Green box if fresh, Red box if rotten
    if contours:
        # Find the largest contour (assuming it's the vegetable)
        largest_contour = max(contours, key=cv2.contourArea)
        # Get the coordinates for the box
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Only draw the box if it's reasonably large (filters out tiny camera noise)
        if w > 30 and h > 30:
            cv2.rectangle(img, (x, y), (x + w, y + h), box_color, 2)
            # Add a text label above the box
            label = f"{status} {crop_type}"
            cv2.putText(img, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

    # --- ENCODE FOR FRONTEND ---
    # Convert the image (with the newly drawn box) to Base64 
    # so the React frontend can easily display it
    _, buffer = cv2.imencode('.jpg', img)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Mocking analytics metrics based on SVM result
    freshness_score = 95 if is_fresh else 25
    days = 14 if is_fresh else 1
    
    return {
        'freshness_status': status,
        'freshness_percent': freshness_score,
        'days_to_spoil': days,
        'ml_confidence': 0.92,
        'analysis_method': 'SVM_WITH_BOUNDING_BOX',
        'crop_type': crop_type,
        'model_prediction': prediction,
        # Send the processed image string back!
        'processed_image_base64': f"data:image/jpeg;base64,{image_base64}" 
    }