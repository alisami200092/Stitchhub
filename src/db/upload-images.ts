import { createClient } from "@supabase/supabase-js";
import { db } from "./index";
import { products } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Starting image migration to Supabase Storage...");

  // 1. Ensure bucket exists and is public
  try {
    await supabase.storage.createBucket("product-images", { public: true });
    console.log("Bucket 'product-images' verified/created.");
  } catch {
    console.log("Bucket already exists or check failed, continuing...");
  }

  // 2. Fetch all products from DB
  const list = await db.select().from(products);
  console.log(`Found ${list.length} products to check.`);

  for (const product of list) {
    // If the image path starts with /images/, it is a local path
    if (product.img.startsWith("/images/")) {
      const relativePath = product.img.replace(/^\//, ""); // remove leading slash
      const localFilePath = path.join(process.cwd(), "public", relativePath);

      if (fs.existsSync(localFilePath)) {
        console.log(`Uploading local file for ${product.title}: ${localFilePath}`);
        const fileBuffer = fs.readFileSync(localFilePath);
        const fileName = path.basename(localFilePath);
        
        // Upload to storage
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, fileBuffer, {
            contentType: "image/webp",
            upsert: true
          });

        if (error) {
          console.error(`Failed to upload ${fileName}:`, error.message);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        console.log(`Uploaded! Public URL: ${publicUrl}`);

        // Update DB
        await db
          .update(products)
          .set({ img: publicUrl })
          .where(eq(products.id, product.id));
        
        console.log(`Database updated for product ${product.id}`);
      } else {
        console.warn(`Local file not found for ${product.title}: ${localFilePath}`);
      }
    } else {
      console.log(`Skipping ${product.title} (already cloud-hosted: ${product.img})`);
    }
  }

  console.log("Image migration completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
