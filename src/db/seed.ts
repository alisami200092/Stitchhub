import fs from "fs";
import path from "path";
import { catalog } from "../data/products";

// Manually load .env.local BEFORE importing db to prevent hoisting issues
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  console.log("Seeding products to Supabase...");
  const { db } = await import("./index");
  const { products } = await import("./schema");
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
