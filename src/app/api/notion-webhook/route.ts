import { notion } from "@/lib/notion";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace("sha256=", "")),
    Buffer.from(expected)
  );
}

function isVideoUrl(name: string): boolean {
  return /\.(mp4|webm|mov|avi)$/i.test(name);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-notion-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // Notion sends a verification challenge on webhook registration
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  const pageId = payload.entity?.id;
  if (!pageId) return NextResponse.json({ ok: true });

  const page = await notion.pages.retrieve({ page_id: pageId }) as any;
  const properties = page.properties;

  const mediaFiles = properties["Media File"]?.files;
  if (!mediaFiles || mediaFiles.length === 0) {
    // No media file — still revalidate in case text content changed
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }

  const file = mediaFiles[0];
  const fileUrl = file.type === "file" ? file.file.url : file.external?.url;
  const fileName = file.name ?? "";

  if (!fileUrl) {
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }

  const result = await cloudinary.uploader.upload(fileUrl, {
    resource_type: isVideoUrl(fileName) ? "video" : "image",
    folder: "portfolio",
    // Keep original filename as public_id for easy identification
    use_filename: true,
    unique_filename: true,
  });

  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Media URL": { url: result.secure_url },
    },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
