import joblib
import cv2
import numpy as np
import os
import base64

model_path = os.path.join(os.path.dirname(__file__), 'svm_vegetable_model.pkl')
try:
    svm_model = joblib.load(model_path)
except FileNotFoundError:
    raise FileNotFoundError(f"SVM Model not found at {model_path}.")

def analyze_crop_image(image_bytes: bytes, crop_type: str = 'EGGPLANT') -> dict:
    # 1. Decode bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"error": "Failed to decode image"}

    # 2. Create grayscale for analysis
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. SVM Prediction
    img_resized = cv2.resize(img_gray, (64, 64))
    features = img_resized.flatten().reshape(1, -1)
    prediction = svm_model.predict(features)[0]
    probabilities = svm_model.predict_proba(features)[0]
    real_confidence = float(np.max(probabilities))
    
    # 4. Status logic
    CONFIDENCE_THRESHOLD = 0.82
    if real_confidence < CONFIDENCE_THRESHOLD:
        status = 'UNKNOWN'
        label = "No Crop Detected"
        box_color = (128, 128, 128) # Gray
        is_fresh = False
    else:
        is_fresh = 'fresh' in prediction.lower()
        status = 'GREEN' if is_fresh else 'RED'
        label = f"{status} {crop_type}"
        # Ensure BGR tuple format using standard integers
        box_color = (0, 255, 0) if is_fresh else (0, 0, 255)

    # 5. Drawing (Contours on grayscale threshold)
    blurred = cv2.GaussianBlur(img_gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        if w > 30 and h > 30:
            # Use standard Python ints to avoid numpy type errors
            cv2.rectangle(img, (int(x), int(y)), (int(x + w), int(y + h)), box_color, 2)
            cv2.putText(img, label, (int(x), int(y - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

    # 6. Encode
    success, buffer = cv2.imencode('.jpg', img)
    if not success:
        return {"error": "Failed to encode image"}
        
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return {
        'freshness_status': status,
        'freshness_percent': int(real_confidence * 100),
        'days_to_spoil': 5 if is_fresh else 1,
        'ml_confidence': real_confidence,
        'analysis_method': 'SVM_WITH_BOUNDING_BOX',
        'crop_type': crop_type,
        'model_prediction': prediction,
        'processed_image_base64': f"data:image/jpeg;base64,{image_base64}" 
    }