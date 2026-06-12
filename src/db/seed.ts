import { db } from "./index";
import { products } from "./schema";
import { catalog } from "../data/products";

async function main() {
  console.log("Seeding products...");
  for (const item of catalog) {
    await db.insert(products).values([
      {
        id: item.id,
        title: item.title,
        cat: item.cat,
        img: item.img,
        price: item.price,
        priceRange: item.priceRange || "",
        description: item.description,
        moq: item.moq,
        customization: item.customization || "",
      }
    ]).onConflictDoUpdate({
      target: products.id,
      set: {
        title: item.title,
        cat: item.cat,
        img: item.img,
        price: item.price,
        priceRange: item.priceRange || "",
        description: item.description,
        moq: item.moq,
        customization: item.customization || "",
      }
    });
  }
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
