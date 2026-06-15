import "server-only";
import { Client } from "@notionhq/client";
import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { markdownToHTML } from "@/lib/markdown";

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
        image: properties.Cover?.url || "",
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
          return html.replace(
            /<img /g,
            '<img style="max-height:420px;width:auto;max-width:100%;display:block;margin:0 auto;" '
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

  // Cap standalone images (no existing inline style = not from columns) so
  // portrait images don't stretch to full article width.
  const html = raw.replace(
    /<img (?![^>]*style=)/g,
    '<img style="max-height:600px;width:auto;max-width:100%;display:block;margin:0 auto;" '
  );

  return {
    html,
    metadata: {
      title: properties.Title?.title?.map((t: any) => t.plain_text).join("") || "Untitled",
      publishedAt: properties.PublishedAt?.date?.start || "",
      summary: properties.Summary?.rich_text?.map((t: any) => t.plain_text).join("") || "",
      image: properties.Cover?.url || "",
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
