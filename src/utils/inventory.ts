/**
 * Maps a dynamic product title (potentially containing customization details or brand names like Gildan, Under Armour, etc.)
 * to one of the five core inventory names in the `materials_inventory` table.
 */
export function mapProductToInventoryItem(productTitle: string): string | null {
  if (!productTitle) return null;
  const lower = productTitle.toLowerCase();
  
  if (lower.includes("hoodie") || lower.includes("windbreaker")) {
    return "Gildan 18500 Hoodie";
  }
  if (lower.includes("polo")) {
    return "Minimalist Corporate Polo";
  }
  if (lower.includes("tumbler") || lower.includes("flask")) {
    return "Insulated Matte Tumbler";
  }
  if (lower.includes("organizer") || lower.includes("pouch")) {
    return "EDC Tech Organizer Pouch";
  }
  if (lower.includes("acoustic") || lower.includes("panel")) {
    return "Framed Acoustic Art Panel";
  }
  
  return null;
}
