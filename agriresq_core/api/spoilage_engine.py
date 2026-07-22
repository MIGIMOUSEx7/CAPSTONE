"""
Rule-based spoilage prediction engine for AgriResQ.
Uses VPD, CHU, and PAES 417:2002-inspired thresholds per crop type.
"""
from decimal import Decimal
from typing import Tuple

# Baseline Configurations based on PAES 417:2002 agricultural standards
CROP_CONFIG = {
    'EGGPLANT': {
        'baseline_shelf_life': Decimal('5.0'),
        'optimal_temp': Decimal('12.0'),
        'stress_temp': Decimal('25.0'),
        'optimal_rh': Decimal('92.5'),
        'min_rh': Decimal('85.0'),
    },
    'CUCUMBER': {
        'baseline_shelf_life': Decimal('4.0'),
        'optimal_temp': Decimal('11.5'),
        'stress_temp': Decimal('25.0'),
        'optimal_rh': Decimal('95.0'),
        'min_rh': Decimal('85.0'),
    },
    'CARROT': {
        'baseline_shelf_life': Decimal('7.0'),
        'optimal_temp': Decimal('0.0'),
        'stress_temp': Decimal('25.0'),
        'optimal_rh': Decimal('98.0'),
        'min_rh': Decimal('90.0'),
    },
}

def calculate_svp(temp_c: Decimal) -> Decimal:
    """Calculates Saturated Vapor Pressure (SVP) using the Tetens formula."""
    t = float(temp_c)
    # Using the standard Tetens equation for SVP in kPa
    return Decimal(str(0.6108 * (2.71828 ** ((17.27 * t) / (t + 237.3)))))

def calculate_vpd(temp_c: Decimal, rh: Decimal) -> Decimal:
    """Calculates Vapor Pressure Deficit (VPD) in kPa."""
    svp = calculate_svp(temp_c)
    # Actual Vapor Pressure
    avp = svp * (rh / Decimal('100'))
    # Return the deficit (cannot be negative)
    return max(svp - avp, Decimal('0'))

def calculate_stress_multiplier(temp_c: Decimal, rh: Decimal, crop_type: str) -> Decimal:
    """Calculates how much faster the crop ages based on thermal and moisture stress."""
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    multiplier = Decimal('1.0') # Base rate: 1 hour = 1 hour aged

    # Heat stress: Temp is above the stress threshold
    if temp_c > config['stress_temp']:
        excess = temp_c - config['stress_temp']
        multiplier += excess * Decimal('0.15')

    # Severe heat stress: Temp is above 30C (Extreme Bulua Market conditions)
    if temp_c > Decimal('30'):
        multiplier += (temp_c - Decimal('30')) * Decimal('0.10')

    # Moisture stress: Humidity is too low (causes shriveling)
    if rh < config['min_rh']:
        deficit = config['min_rh'] - rh
        multiplier += deficit * Decimal('0.02')

    # Cap the multiplier at 5x to prevent absurd decay rates
    return min(multiplier, Decimal('5.0'))

def calculate_chu_increment(temp_c: Decimal, crop_type: str) -> Decimal:
    """Calculates the Cumulative Heat Unit (CHU) penalty for sustained heat exposure."""
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    if temp_c > config['stress_temp']:
        return (temp_c - config['stress_temp']) * Decimal('0.5')
    return Decimal('0')

def classify_status(days_to_spoil: Decimal) -> str:
    """Maps the remaining shelf life to the UI 'Traffic Light' Dashboard status."""
    if days_to_spoil <= Decimal('0'):
        return 'RED'
    if days_to_spoil < Decimal('3'):
        return 'AMBER'
    return 'GREEN'

def freshness_percent(days_to_spoil: Decimal, baseline: Decimal) -> int:
    """Converts the remaining days into a 0-100% freshness score."""
    if baseline <= 0:
        return 0
    pct = int((days_to_spoil / baseline) * 100)
    return max(0, min(100, pct))

def predict_spoilage(
    crop_type: str,
    current_shelf_life: Decimal,
    temp_c: Decimal,
    rh: Decimal,
    chu_accumulated: Decimal = Decimal('0'),
    hours_elapsed: Decimal = Decimal('1.0'),
) -> Tuple[str, Decimal, Decimal, Decimal]:
    """
    The master function that calculates the new ETA based on the DHT22 readings.
    Returns (status, days_to_spoil, new_chu, vpd).
    """
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    
    # 1. Calculate environmental metrics
    vpd = calculate_vpd(temp_c, rh)
    stress = calculate_stress_multiplier(temp_c, rh, crop_type)
    
    # 2. Update Cumulative Heat Units
    chu_delta = calculate_chu_increment(temp_c, crop_type) * hours_elapsed
    new_chu = chu_accumulated + chu_delta

    # 3. Calculate biological time lost
    life_lost = (hours_elapsed / Decimal('24')) * stress
    chu_penalty = new_chu * Decimal('0.01')
    
    # 4. Determine new ETA
    days_to_spoil = current_shelf_life - life_lost - chu_penalty
    days_to_spoil = max(days_to_spoil, Decimal('0'))

    # 5. Determine UI Status
    status = classify_status(days_to_spoil)
    
    return status, days_to_spoil, new_chu, vpd

def validate_sensor_reading(temp_c: float, rh: float, ethylene_ppm: float = None) -> bool:
    """
    Rejects physically impossible sensor values to protect the system 
    from hardware glitches or disconnected data lines.
    """
    if not (-10 <= temp_c <= 60):
        return False
    if not (0 <= rh <= 100):
        return False
    if ethylene_ppm is not None and not (0 <= ethylene_ppm <= 100):
        return False
    return True