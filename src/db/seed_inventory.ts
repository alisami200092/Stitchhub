import { db } from "./index";
import { materialsInventory } from "./schema";

async function main() {
  console.log("Seeding materials inventory...");
  
  const items = [
    {
      productName: "Minimalist Corporate Polo (BLK-Plique)",
      stockQuantity: 10, // Depleted (lower than the 50 units in RFQ #1042)
      reorderLevel: 20,
    },
    {
      productName: "Gildan Hoodie",
      stockQuantity: 150,
      reorderLevel: 20,
    },
    {
      productName: "Matte Tumbler",
      stockQuantity: 100,
      reorderLevel: 20,
    },
  ];

  for (const item of items) {
    await db.insert(materialsInventory).values(item).onConflictDoUpdate({
      target: materialsInventory.productName,
      set: {
        stockQuantity: item.stockQuantity,
        reorderLevel: item.reorderLevel,
      },
    });
  }

  console.log("Inventory seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Inventory seeding failed:", err);
  process.exit(1);
});
