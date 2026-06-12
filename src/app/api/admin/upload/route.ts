import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";
import { isAdmin } from "@/utils/admin";

export async function POST(req: Request) {
  // 1. Auth Guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // 3. Parse and validate file upload
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 });
    }

    // Strict Size Limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds the 5MB limit." }, { status: 400 });
    }

    // Strict Mime Type Allow-list
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // 4. Generate unique filename (UUID)
    let ext = "webp";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/jpeg") ext = "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Upload to Supabase Storage bucket
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.warn("Storage upload error, attempting to create bucket first:", error.message);
      // Attempt to automatically create the bucket if missing
      try {
        await supabase.storage.createBucket("product-images", { public: true });
        const retry = await supabase.storage
          .from("product-images")
          .upload(fileName, buffer, {
            contentType: file.type,
          });
        if (retry.error) throw retry.error;
      } catch (createErr) {
        console.error("Failed to upload image to bucket:", createErr);
        return NextResponse.json({ 
          error: "Failed to upload image to storage. Make sure a public 'product-images' bucket is created in your Supabase Storage dashboard." 
        }, { status: 500 });
      }
    }

    // 6. Resolve public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error("Internal upload handler failure:", error);
    return NextResponse.json({ error: "Failed to process image upload." }, { status: 500 });
  }
}
