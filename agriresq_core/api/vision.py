"""
Vision-based freshness analysis for ESP32-CAM images.
Placeholder heuristic until ML model is deployed — replace with TensorFlow/PyTorch inference.
"""
import io
from decimal import Decimal
from PIL import Image
from .spoilage_engine import classify_status, freshness_percent, CROP_CONFIG


def analyze_crop_image(image_bytes: bytes, crop_type: str = 'EGGPLANT') -> dict:
    """
    Analyze produce image and return freshness metrics.
    Uses color/brightness heuristics as stand-in for ML classification.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img.thumbnail((224, 224))
    pixels = list(img.getdata())

    # Heuristic: average green channel vs red (wilting/discoloration proxy)
    avg_r = sum(p[0] for p in pixels) / len(pixels)
    avg_g = sum(p[1] for p in pixels) / len(pixels)
    avg_b = sum(p[2] for p in pixels) / len(pixels)
    brightness = (avg_r + avg_g + avg_b) / 3

    # Score 0-100 (higher = fresher)
    green_ratio = avg_g / max(avg_r + avg_g + avg_b, 1)
    score = min(100, max(20, int(green_ratio * 120 + (brightness / 255) * 20)))

    if crop_type == 'CARROT':
        score = min(100, score + 5)
    elif crop_type == 'CUCUMBER':
        score = min(100, max(score - 5, 30))

    baseline = float(CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])['baseline_shelf_life'])
    days = round(baseline * (score / 100), 2)
    status = classify_status(Decimal(str(days)))
    if score >= 70:
        status = 'GREEN'
    elif score >= 40:
        status = 'AMBER'
    else:
        status = 'RED'
        days = max(0.5, days)

    ml_confidence = round(min(95, 60 + green_ratio * 35), 1)

    return {
        'freshness_status': status,
        'freshness_percent': score,
        'days_to_spoil': days,
        'ml_confidence': ml_confidence,
        'analysis_method': 'VISION_HEURISTIC',
        'crop_type': crop_type,
    }
