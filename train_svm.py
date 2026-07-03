import os
import cv2
import joblib
import numpy as np
from sklearn import svm
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Configuration for your specific Capstone crops
DATA_DIR = 'ML'
CATEGORIES = [
    'fresh_eggplant', 'rotten_eggplant',
    'fresh_cucumber', 'rotten_cucumber',
    'fresh_carrots', 'rotten_carrots'
]

print("🚀 Starting Advanced SVM Training with Data Augmentation...")

def augment_image(img):
    """
    Takes a single image and creates 4 variations of it.
    This helps the AI learn better when you have a small dataset.
    """
    augmented_images = [img] # Original
    
    # 1. Horizontal Flip
    augmented_images.append(cv2.flip(img, 1))
    
    # 2. Vertical Flip
    augmented_images.append(cv2.flip(img, 0))
    
    # 3. Rotate 15 degrees
    (h, w) = img.shape[:2]
    matrix = cv2.getRotationMatrix2D((w/2, h/2), 15, 1.0)
    rotated = cv2.warpAffine(img, matrix, (w, h))
    augmented_images.append(rotated)
    
    return augmented_images

data = []
labels = []

# Load Data
for category in CATEGORIES:
    path = os.path.join(DATA_DIR, category)
    
    # Skip if the folder doesn't exist yet
    if not os.path.exists(path):
        print(f"⚠️ Warning: Folder '{path}' not found. Skipping...")
        continue
        
    image_count = 0
    for img_name in os.listdir(path):
        img_path = os.path.join(path, img_name)
        # Load image as grayscale to keep the SVM fast and lightweight
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        
        if img is not None:
            # Resize to exactly 64x64 pixels
            img_resized = cv2.resize(img, (64, 64))
            
            # Apply our data augmentation trick
            aug_imgs = augment_image(img_resized)
            
            for a_img in aug_imgs:
                # Flatten the 64x64 grid into a single line of numbers for the SVM
                data.append(a_img.flatten())
                labels.append(category)
            image_count += 1
            
    print(f"✅ Loaded {image_count} original images from {category} (Turned into {image_count * 4} augmented samples).")

if len(data) == 0:
    print("❌ ERROR: No images found! Please put some images in your ML folders.")
    exit()

print(f"\n🧠 Training SVM on a total of {len(data)} samples...")

# Train/Test Split (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42)

# Create the SVM Model
# probability=True allows us to get the confidence score (e.g., 92%)
clf = svm.SVC(kernel='linear', probability=True)

# Train it!
clf.fit(X_train, y_train)

# Evaluation for your Capstone Paper (F1 Scores)
print("\n📊 --- MODEL EVALUATION (Put this in your Chapter 4) ---")
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

# Save the model
model_filename = 'svm_vegetable_model.pkl'
joblib.dump(clf, model_filename)
print(f"\n✅ Success! Model saved as '{model_filename}'.")
print("⚠️ CRITICAL: Move this file into your 'agriresq_core/api/' folder before restarting Django!")