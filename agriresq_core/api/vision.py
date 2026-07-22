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
    
    blurred = cv2.GaussianBlur(img_gray, (7, 7), 0)
    edges = cv2.Canny(blurred, 30, 150)
    
    # Find contours (the outlines of the vegetables)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    valid_object_found = False
    x, y, w, h = 0, 0, 0, 0
    
    if contours:
        # Find the largest outline
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Rule: The object must be a decent size, BUT it cannot be the whole screen.
        # This prevents a blank wall from being boxed as one giant object.
        img_h, img_w = img.shape[:2]
        if (w > 60 and h > 60) and (w < img_w * 0.90 and h < img_h * 0.90):
            valid_object_found = True

    if valid_object_found:
        # --- CRITICAL FIX: ANALYZE THE CROP, NOT THE BACKGROUND ---
        # We cut out the exact box where the object is, and only feed THAT to the AI.
        roi_gray = img_gray[y:y+h, x:x+w]
        
        # Resize the cropped object to 64x64 for the SVM
        img_resized = cv2.resize(roi_gray, (64, 64))
        features = img_resized.flatten().reshape(1, -1)
        
        # Get the predicted label and confidence
        prediction = svm_model.predict(features)[0] 
        probabilities = svm_model.predict_proba(features)[0]
        real_confidence = float(np.max(probabilities))
        
        if 'eggplant' in prediction.lower():
            detected_crop = 'EGGPLANT'
        elif 'cucumber' in prediction.lower():
            detected_crop = 'CUCUMBER'
        elif 'carrot' in prediction.lower():
            detected_crop = 'CARROTS'
        else:
            detected_crop = 'UNKNOWN'
    else:
        # If no distinct edges are found (blank wall), skip the AI completely!
        prediction = "none"
        real_confidence = 0.0
        detected_crop = 'UNKNOWN'
    
    # --- STRICTER CONFIDENCE THRESHOLD ---
    CONFIDENCE_THRESHOLD = 0.90 # Raised to 90% strictness!
    
    if not valid_object_found or real_confidence < CONFIDENCE_THRESHOLD:
        status = 'UNKNOWN'
        freshness_score = 0
        days = 0
        label = "Waiting for object..."
        box_color = (200, 200, 200) 
        is_fresh = False
        detected_crop = 'UNKNOWN' 
        
        # Draw a neutral box in the center just so you know the camera is working
        if not valid_object_found:
            img_h, img_w = img.shape[:2]
            cv2.putText(img, label, (img_w//2 - 80, img_h//2), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200,200,200), 2)
    else:
        is_fresh = 'fresh' in prediction.lower()
        status = 'GREEN' if is_fresh else 'RED'

        baseline_days = {'EGGPLANT': 14, 'CUCUMBER': 12, 'CARROTS': 21}
        max_days = baseline_days.get(detected_crop, 14) 

        if is_fresh:
            freshness_score = int(real_confidence * 100)
            days = max(3, int(max_days * real_confidence)) 
        else:
            freshness_score = int((1.0 - real_confidence) * 100)
            days = 1 if real_confidence < 0.8 else 0
            
        label = f"{status} {detected_crop} ({int(real_confidence*100)}%)"
        box_color = (0, 255, 0) if is_fresh else (0, 0, 255) 
        
        # Draw the tightly cropped bounding box around the actual vegetable
        cv2.rectangle(img, (x, y), (x + w, y + h), box_color, 2)
        cv2.putText(img, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

    # --- ENCODE FOR FRONTEND ---
    # Convert the image (with the newly drawn box) to Base64 
    # so the React frontend can easily display it
    _, buffer = cv2.imencode('.jpg', img)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return {
        'freshness_status': status,
        'freshness_percent': freshness_score,
        'days_to_spoil': days,
        'ml_confidence': real_confidence, 
        'analysis_method': 'SVM_WITH_BOUNDING_BOX',
        'crop_type': detected_crop, # <-- Use the AI's auto-detected crop!
        'model_prediction': prediction,
        'processed_image_base64': f"data:image/jpeg;base64,{image_base64}" 
    }