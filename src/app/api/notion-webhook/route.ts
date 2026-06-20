import { notion } from "@/lib/notion";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

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

// Maps each Files & media property → the URL property to write back + Cloudinary resource type
const FILE_PROPS: Record<string, { urlProp: string; resourceType: "image" | "video" | "raw" | "auto" }> = {
  "Media File":  { urlProp: "Media URL", resourceType: "auto" },  // project images/videos
  "Logo File":   { urlProp: "Logo",      resourceType: "image" }, // company/school logos
  "Avatar File": { urlProp: "Avatar",    resourceType: "image" },
  "Resume File": { urlProp: "Resume",    resourceType: "raw" },
  "Cover File":  { urlProp: "Cover",     resourceType: "image" }, // blog cover images
  "Map File":    { urlProp: "Map Image", resourceType: "image" },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const payload = JSON.parse(body);

  // Handle Notion's verification challenge before signature check
  if (payload.verification_token) {
    console.log("[webhook] verification_token:", payload.verification_token);
    return NextResponse.json({ verification_token: payload.verification_token });
  }

  const signature = request.headers.get("x-notion-signature") ?? "";
  if (!verifySignature(body, signature)) {
    console.warn("[webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = payload.type ?? "unknown";
  const pageId = payload.entity?.id;
  const updatedProperties: string[] = payload.data?.updated_properties ?? [];
  console.log(`[webhook] event=${eventType} pageId=${pageId} updatedProps=${JSON.stringify(updatedProperties)}`);

  if (!pageId) return NextResponse.json({ ok: true });

  console.log("[webhook] fetching page from Notion...");
  const page = await notion.pages.retrieve({ page_id: pageId }) as any;
  const properties = page.properties;

  // Notion sends property IDs in updated_properties, not names — build a reverse map
  const propIdToName: Record<string, string> = {};
  for (const [name, prop] of Object.entries(properties)) {
    propIdToName[(prop as any).id] = name;
  }

  const fileProps = Object.keys(FILE_PROPS);
  const hasFileChange =
    updatedProperties.length === 0 ||
    updatedProperties.some((id) => fileProps.includes(propIdToName[id]));

  if (!hasFileChange) {
    console.log("[webhook] no file property changed, skipping upload");
    revalidatePath("/");
    return NextResponse.json({ ok: true, uploaded: false });
  }

  let uploaded = false;

  for (const [fileProp, { urlProp, resourceType }] of Object.entries(FILE_PROPS)) {
    const files = properties[fileProp]?.files;
    if (!files || files.length === 0) continue;

    const file = files[0];
    const fileUrl = file.type === "file" ? file.file.url : file.external?.url;
    const fileName = file.name ?? "unknown";

    if (!fileUrl) {
      console.warn(`[webhook] ${fileProp}: file found but no URL extractable`);
      continue;
    }

    console.log(`[webhook] ${fileProp}: uploading "${fileName}" to Cloudinary (resource_type=${resourceType})...`);

    let result;
    try {
      if (resourceType === "image") {
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const compressed = await sharp(buffer)
          .resize({ width: 2000, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        console.log(`[webhook] ${fileProp}: compressed to ${(compressed.length / 1024 / 1024).toFixed(2)} MB`);
        result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "portfolio", use_filename: true, unique_filename: true },
            (err, res) => err ? reject(err) : resolve(res)
          );
          stream.end(compressed);
        });
      } else {
        result = await cloudinary.uploader.upload(fileUrl, {
          resource_type: resourceType,
          folder: "portfolio",
          use_filename: true,
          unique_filename: true,
        });
      }
    } catch (err: any) {
      console.error(`[webhook] ${fileProp}: Cloudinary upload failed:`, err?.message ?? err, err?.http_code, err?.error);
      continue;
    }

    console.log(`[webhook] ${fileProp}: uploaded → ${result.secure_url}`);

    await notion.pages.update({
      page_id: pageId,
      properties: {
        [urlProp]: { url: result.secure_url },
        [fileProp]: { files: [] },  // clear file property to prevent re-processing on subsequent events
      },
    });

    console.log(`[webhook] ${fileProp}: wrote Cloudinary URL to "${urlProp}" and cleared file property`);
    uploaded = true;
  }

  if (!uploaded) {
    console.log("[webhook] no file properties found — revalidating only");
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  console.log("[webhook] revalidated / and /blog");

  return NextResponse.json({ ok: true, uploaded });
}
