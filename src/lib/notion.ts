import "server-only";
import { Client } from "@notionhq/client";
import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { markdownToHTML } from "@/lib/markdown";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Module-level cache: survives ISR re-renders within the same process.
// On cold start (new deployment), Cloudinary's resource() check prevents re-uploads.
const imgUrlCache = new Map<string, string>();

function notionImgPublicId(url: string): string {
  const pathname = new URL(url).pathname;
  const hash = crypto.createHash("sha256").update(pathname).digest("hex").slice(0, 24);
  return `portfolio/blog/${hash}`;
}

async function toCdnUrl(notionUrl: string): Promise<string> {
  const publicId = notionImgPublicId(notionUrl);
  if (imgUrlCache.has(publicId)) return imgUrlCache.get(publicId)!;

  try {
    const existing = await cloudinary.api.resource(publicId);
    imgUrlCache.set(publicId, existing.secure_url);
    return existing.secure_url;
  } catch {
    const response = await fetch(notionUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const compressed = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const uploaded = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: false, resource_type: "image" },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(compressed);
    });
    imgUrlCache.set(publicId, uploaded.secure_url);
    return uploaded.secure_url;
  }
}

async function rewriteNotionImages(html: string): Promise<string> {
  const notionSrcs = new Set<string>();
  const srcPattern = /(<img[^>]+\ssrc=")([^"]+)(")/g;
  let m;
  while ((m = srcPattern.exec(html)) !== null) {
    const url = m[2];
    if (url.includes("X-Amz-Signature") || url.includes("amazonaws.com")) {
      notionSrcs.add(url);
    }
  }
  if (notionSrcs.size === 0) return html;

  const urlMap = new Map<string, string>();
  await Promise.all(
    Array.from(notionSrcs).map(async (src) => {
      try {
        urlMap.set(src, await toCdnUrl(src));
      } catch (e) {
        console.error("[notion] failed to proxy image to Cloudinary:", e);
      }
    })
  );

  return html.replace(/(<img[^>]+\ssrc=")([^"]+)(")/g, (_, pre, src, post) =>
    urlMap.has(src) ? pre + urlMap.get(src)! + post : pre + src + post
  );
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getPersonal = cache(async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PERSONAL!,
  });

  const data = response.results.map((page: PageObjectResponse | any) => {
    const properties = page.properties;

    return {
      id: page.id,
      lastEditedAt: page.last_edited_time as string,
      name: properties.Name?.title[0]?.plain_text || "Untitled",
      description: properties.Description?.rich_text[0]?.plain_text || "",
      location: properties.Location?.rich_text[0]?.plain_text || "",
      initials: properties.Initials?.rich_text[0]?.plain_text || "",
      avatar: properties.Avatar?.url || "",
      resume: properties.Resume?.url || "",
      email: properties.Email?.email || "",
      phone: properties["Phone Number"]?.phone_number || "",
      url: properties.URL?.url || "",
      github: properties.GitHub?.url || "",
      githubid: properties.githubid?.rich_text[0]?.plain_text || "",
      linkedin: properties.Linkedin?.url || "",
      twitter: properties.Twitter?.url || "",
      instagram: properties.Instagram?.url || "",
      youtube: properties.YouTube?.url || "",
      skills:
        properties.Skills?.multi_select.map((skill: any) => skill.name) || [],
      timezone: properties.Timezone?.rich_text[0]?.plain_text || "UTC",
      mapImage:
        properties["Map File"]?.files?.[0]?.file?.url ||
        properties["Map File"]?.files?.[0]?.external?.url ||
        properties["Map Image"]?.url ||
        "",
    };
  });

  return data[0];
});

export const getNotionBlogPosts = cache(async () => {
  if (!process.env.NOTION_BLOG_DB) return [];

  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DB,
    filter: {
      property: "Status",
      select: { equals: "Published" },
    },
    sorts: [{ property: "PublishedAt", direction: "descending" }],
  });

  return response.results.map((page: PageObjectResponse | any) => {
    const properties = page.properties;
    return {
      pageId: page.id as string,
      slug: properties.Slug?.rich_text[0]?.plain_text || page.id,
      metadata: {
        title: properties.Title?.title?.map((t: any) => t.plain_text).join("") || "Untitled",
        publishedAt: properties.PublishedAt?.date?.start || "",
        summary: properties.Summary?.rich_text?.map((t: any) => t.plain_text).join("") || "",
        image: properties.Cover?.rich_text?.[0]?.plain_text || properties.Cover?.url || "",
      },
    };
  });
});

// Recursively flattens an MdBlock subtree to a markdown string, same
// logic as n2m.toMarkdownString but without the outer wrapper.
function mdBlockToString(block: any): string {
  let out = block.parent ?? "";
  for (const child of block.children ?? []) {
    out += "\n\n" + mdBlockToString(child);
  }
  return out;
}

// Walks the MdBlock tree and converts column_list blocks into raw flex HTML
// so that side-by-side Notion layouts are preserved. Children are cleared
// after processing to prevent notion-to-md from duplicating their content.
async function resolveColumns(blocks: any[]): Promise<any[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (block.type !== "column_list") {
        return { ...block, children: await resolveColumns(block.children ?? []) };
      }

      const columnHtmls = await Promise.all(
        (block.children ?? []).map(async (column: any) => {
          const colMarkdown = (column.children ?? [])
            .map(mdBlockToString)
            .join("\n\n");
          const html = await markdownToHTML(colMarkdown);
          // Constrain images to the same max-height so columns appear balanced
          return html.replace(/<img ([^>]*)>/g, (_, attrs) =>
            `<span class="img-skeleton"><img loading="lazy" decoding="async" onload="this.style.opacity='1';this.parentElement.classList.add('img-loaded')" style="opacity:0;transition:opacity 0.4s ease;max-height:420px;width:auto;max-width:100%;display:block;margin:0 auto;" ${attrs}></span>`
          );
        })
      );

      const flexHtml = `<div style="display:flex;gap:1rem;align-items:flex-start;">${columnHtmls
        .map((html) => `<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;">${html}</div>`)
        .join("")}</div>`;

      return { ...block, parent: flexHtml, children: [] };
    })
  );
}

export const getNotionPostMarkdown = cache(async (slug: string) => {
  if (!process.env.NOTION_BLOG_DB) return null;

  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DB,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as PageObjectResponse | any;
  const properties = page.properties;

  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const resolved = await resolveColumns(mdBlocks);
  const { parent: markdown } = n2m.toMarkdownString(resolved);
  const raw = await markdownToHTML(markdown);

  // Cap standalone images (no existing style = not already wrapped from columns)
  // and wrap in a skeleton container to reserve space while loading.
  const wrapped = raw.replace(/<img (?![^>]*style=)([^>]*)>/g, (_, attrs) =>
    `<span class="img-skeleton"><img loading="lazy" decoding="async" onload="this.style.opacity='1';this.parentElement.classList.add('img-loaded')" style="opacity:0;transition:opacity 0.4s ease;max-height:600px;width:auto;max-width:100%;display:block;margin:0 auto;" ${attrs}></span>`
  );

  // Rewrite expiring Notion S3 URLs to permanent Cloudinary URLs so browsers
  // can cache images across navigations and ISR re-renders.
  const html = await rewriteNotionImages(wrapped);

  return {
    html,
    metadata: {
      title: properties.Title?.title?.map((t: any) => t.plain_text).join("") || "Untitled",
      publishedAt: properties.PublishedAt?.date?.start || "",
      summary: properties.Summary?.rich_text?.map((t: any) => t.plain_text).join("") || "",
      image: properties.Cover?.rich_text?.[0]?.plain_text || properties.Cover?.url || "",
    },
  };
});

export const getPortfolio = cache(async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PORTFOLIO!,
    sorts: [
      {
        property: "Start Date",
        direction: "descending",
      },
    ],
  });

  const data = response.results.map((page: PageObjectResponse | any) => {
    const properties = page.properties;

    return {
      id: page.id,
      lastEditedAt: page.last_edited_time as string,
      title: properties.Title?.title?.map((t: any) => t.plain_text).join("").trim() || "Untitled",
      subtitle: properties.Subtitle?.rich_text?.map((t: any) => t.plain_text).join("") || "",
      description: properties.Description?.rich_text?.map((t: any) => t.plain_text).join("") || "",
      logoUrl: properties.Logo?.url || "",
      mediaUrl: properties["Media URL"]?.url || "",
      url: properties.URL?.url || "",
      source: properties.Source?.url || "",
      category: properties.Category?.select?.name || "Uncategorized",
      technologies:
        properties.Technologies?.multi_select.map((tag: any) => tag.name) || [],
      location: properties.Location?.rich_text[0]?.plain_text || "",
      active: properties.Active?.checkbox || false,
      startDate: properties["Start Date"]?.date?.start || "",
      endDate: properties["End Date"]?.date?.start || "",
    };
  });

  return data;
});
