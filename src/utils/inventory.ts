/**
 * Maps a dynamic product title (potentially containing customization details or brand names like Gildan, Under Armour, etc.)
 * to one of the ten core inventory names in the `materials_inventory` table.
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
  if (lower.includes("briefcase") || lower.includes("cordura")) {
    return "Cordura Ballistic Tech Briefcase";
  }
  if (lower.includes("desk mat") || lower.includes("merino") || lower.includes("wool")) {
    return "Natural Merino Wool Desk Mat";
  }
  if (lower.includes("duffel") || lower.includes("waxed canvas")) {
    return "Rugged Waxed Canvas Weekend Duffel";
  }
  if (lower.includes("wallet") || lower.includes("magsafe") || lower.includes("aluminum")) {
    return "Minimalist MagSafe Matte Aluminum Wallet";
  }
  if (lower.includes("keychain") || lower.includes("hardware loop")) {
    return "Full-Grain Leather Hardware Loop Keychain";
  }
  
  return null;
}

