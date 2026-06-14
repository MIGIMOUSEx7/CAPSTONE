"""
Rule-based spoilage prediction engine for AgriResQ.
Uses VPD, CHU, and PAES 417:2002-inspired thresholds per crop type.
"""
from decimal import Decimal
from typing import Tuple

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
    """Saturated vapor pressure using Tetens formula."""
    t = float(temp_c)
    return Decimal(str(0.6108 * (2.71828 ** ((17.27 * t) / (t + 237.3)))))


def calculate_vpd(temp_c: Decimal, rh: Decimal) -> Decimal:
    """Vapor Pressure Deficit in kPa."""
    svp = calculate_svp(temp_c)
    avp = svp * (rh / Decimal('100'))
    return max(svp - avp, Decimal('0'))


def calculate_stress_multiplier(temp_c: Decimal, rh: Decimal, crop_type: str) -> Decimal:
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    multiplier = Decimal('1.0')

    if temp_c > config['stress_temp']:
        excess = temp_c - config['stress_temp']
        multiplier += excess * Decimal('0.15')

    if temp_c > Decimal('30'):
        multiplier += (temp_c - Decimal('30')) * Decimal('0.10')

    if rh < config['min_rh']:
        deficit = config['min_rh'] - rh
        multiplier += deficit * Decimal('0.02')

    return min(multiplier, Decimal('5.0'))


def calculate_chu_increment(temp_c: Decimal, crop_type: str) -> Decimal:
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    if temp_c > config['stress_temp']:
        return (temp_c - config['stress_temp']) * Decimal('0.5')
    return Decimal('0')


def classify_status(days_to_spoil: Decimal) -> str:
    if days_to_spoil <= Decimal('0'):
        return 'RED'
    if days_to_spoil < Decimal('3'):
        return 'AMBER'
    return 'GREEN'


def freshness_percent(days_to_spoil: Decimal, baseline: Decimal) -> int:
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
    Returns (status, days_to_spoil, new_chu, vpd).
    """
    config = CROP_CONFIG.get(crop_type, CROP_CONFIG['EGGPLANT'])
    vpd = calculate_vpd(temp_c, rh)
    stress = calculate_stress_multiplier(temp_c, rh, crop_type)
    chu_delta = calculate_chu_increment(temp_c, crop_type) * hours_elapsed
    new_chu = chu_accumulated + chu_delta

    life_lost = (hours_elapsed / Decimal('24')) * stress
    chu_penalty = new_chu * Decimal('0.01')
    days_to_spoil = current_shelf_life - life_lost - chu_penalty
    days_to_spoil = max(days_to_spoil, Decimal('0'))

    status = classify_status(days_to_spoil)
    return status, days_to_spoil, new_chu, vpd


def validate_sensor_reading(temp_c: float, rh: float, ethylene_ppm: float = None) -> bool:
    """Reject physically impossible sensor values."""
    if not (-10 <= temp_c <= 60):
        return False
    if not (0 <= rh <= 100):
        return False
    if ethylene_ppm is not None and not (0 <= ethylene_ppm <= 100):
        return False
    return True
