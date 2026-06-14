/** Dynamic pricing & auto-discount rules (panel requirements) */
export const DISCOUNT_RULES = {
  GREEN: 0,
  AMBER: 30,
  RED: 100,
}

export function computeDynamicPrice(basePricePerKg, quantityKg, freshnessStatus, autoDiscountEnabled = true) {
  const base = Number(basePricePerKg) || 0
  const qty = Number(quantityKg) || 0
  let discount = 0
  if (autoDiscountEnabled) {
    discount = DISCOUNT_RULES[freshnessStatus] ?? 0
  }
  const currentPerKg = base * (1 - discount / 100)
  return {
    discount_percent: discount,
    current_price_per_kg: Math.round(currentPerKg * 100) / 100,
    total_price: Math.round(currentPerKg * qty * 100) / 100,
    listed_price: Math.round(currentPerKg * qty * 100) / 100,
  }
}

export function statusFromPercent(percent) {
  if (percent <= 0) return 'RED'
  if (percent < 60) return 'AMBER'
  return 'GREEN'
}
