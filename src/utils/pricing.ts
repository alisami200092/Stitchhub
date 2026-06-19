interface PricingResult {
  unitPrice: number;
  totalPrice: number;
}

/**
  * Computes pricing based on product ID and quantity according to the B2B volume pricing tiers:
  * 1. Premium Heavyweight Hoodie: 50-100: $38.00, 101-300: $32.00, 301+: $26.00
  * 2. Minimalist Corporate Polo: 50-100: $22.00, 101-300: $18.00, 301+: $14.50
  * 3. Insulated Matte Tumbler: 50-100: $16.00, 101-300: $12.50, 301+: $9.90
  * 4. EDC Tech Organizer Pouch: 50-100: $24.00, 101-300: $19.00, 301+: $15.00
  * 5. Framed Acoustic Art Panel: 50-100: $85.00, 101-300: $68.00, 301+: $55.00
  */
export function calculateTieredPricing(
  productId: string,
  quantity: number,
  fallbackBasePrice: number = 0
): PricingResult {
  let unitPrice = 0;
  const id = productId.toLowerCase();

  if (id.includes("heavyweight-hoodie")) {
    if (quantity >= 301) unitPrice = 26.00;
    else if (quantity >= 101) unitPrice = 32.00;
    else unitPrice = 38.00;
  } else if (id.includes("corporate-polo")) {
    if (quantity >= 301) unitPrice = 14.50;
    else if (quantity >= 101) unitPrice = 18.00;
    else unitPrice = 22.00;
  } else if (id.includes("insulated-tumbler") || id.includes("matte-tumbler")) {
    if (quantity >= 301) unitPrice = 9.90;
    else if (quantity >= 101) unitPrice = 12.50;
    else unitPrice = 16.00;
  } else if (id.includes("tech-organizer")) {
    if (quantity >= 301) unitPrice = 15.00;
    else if (quantity >= 101) unitPrice = 19.00;
    else unitPrice = 24.00;
  } else if (id.includes("acoustic-panel")) {
    if (quantity >= 301) unitPrice = 55.00;
    else if (quantity >= 101) unitPrice = 68.00;
    else unitPrice = 85.00;
  } else {
    // Fallback standard volume pricing (10% off for 100+ units, 15% off for 250+ units)
    let discount = 1.0;
    if (quantity >= 250) discount = 0.85;
    else if (quantity >= 100) discount = 0.9;
    unitPrice = fallbackBasePrice * discount;
  }

  // Ensure unitPrice is numeric and format decimals nicely
  return {
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    totalPrice: parseFloat((unitPrice * quantity).toFixed(2)),
  };
}
