# Portfolio Architecture

## Stack
- **Next.js 14** (App Router) on Vercel
- **Notion** as CMS (Personal DB + Portfolio DB)
- **Cloudinary** as permanent media CDN
- **MDX files** for blog posts

---

## Data Flow

### Pages

```
Visitor request
  → Vercel serves cached ISR page (fast)
  → If stale or on-demand revalidated: Next.js re-runs page.tsx as a server
    component, calling getPersonal() and getPortfolio() in notion.ts, which
    hit the Notion API and return fresh data. Renders with permanent Cloudinary
    URLs for media. Cached until next revalidation.
```

### Media Pipeline

```
User uploads file to Notion (Media File property)
  → Notion sends POST to yoursite.com/api/notion-webhook
  → /api/notion-webhook is a Next.js API route running as a Vercel serverless
    function — same repo, same deployment. The file's signed URL is still fresh
    since the upload just happened.
  → Handler downloads file from Notion, uploads to Cloudinary
  → Calls notion.pages.update({ properties: { "Media URL": { url: cloudinaryUrl } } })
    — updates just that one field on the Notion page, everything else untouched
  → Calls revalidatePath('/') from next/cache — because the handler is part of
    the Next.js app, it can tell Vercel to discard the cached page so the next
    visitor gets a freshly rendered one with the new Cloudinary URL
```

---

## Revalidation Strategy

| Trigger | Mechanism | Latency |
|---|---|---|
| Content edited in Notion | Notion webhook → `revalidatePath` | ~5-10s |
| Media uploaded to Notion | Same webhook, after Cloudinary upload | ~10-15s |
| Fallback (webhook missed) | ISR `revalidate = 86400` (24hr) | up to 24hr |

No timed polling. Pages stay cached until something actually changes.

---

## Notion DB Schema

### Personal DB
| Property | Type | Notes |
|---|---|---|
| Name | Title | |
| Description | Text | |
| Location | Text | |
| Avatar | URL | Cloudinary URL (already set) |
| Skills | Multi-select | |
| Email | Email | |
| GitHub, LinkedIn, etc. | URL | |

_No changes needed — avatar already on Cloudinary._

### Portfolio DB
| Property | Type | Notes |
|---|---|---|
| Title | Title | |
| Subtitle, Description | Text | |
| Category | Select | Work / Education / Projects / Volunteering |
| Active | Checkbox | |
| Start Date, End Date | Date | |
| Logo | URL | External logo URL (paste manually, rarely changes) |
| URL, Source | URL | |
| Technologies | Multi-select | |
| Location | Text | |
| **Media File** | Files & media | **New** — user uploads image/video here |
| **Media URL** | URL | **New** — webhook writes Cloudinary URL here, app reads this |

---

## API Routes

### `POST /api/notion-webhook`
Triggered by Notion on any Portfolio DB page update.

1. Verify webhook signature
2. Check if `Media File` property has a new file
3. Download the file from Notion's signed S3 URL
4. Upload to Cloudinary (image or video, auto-detected)
5. PATCH Notion page: set `Media URL` = Cloudinary URL
6. Call `revalidatePath('/')` to bust ISR cache
7. Return 200

### No proxy route needed
Cloudinary URLs are permanent — no signed URL expiry problem.

---

## `notion.ts` Changes

- `getPortfolio()`: read `mediaUrl` from `properties["Media URL"]?.url`
- Return `mediaUrl` instead of `imageUrl` for project cards
- If `mediaUrl` ends in `.mp4` or `.webm`, treat as video — pass to `video` prop on `ProjectCard`
- Otherwise treat as image — pass to `image` prop

---

## Environment Variables

```bash
# existing
NOTION_TOKEN=
NOTION_PERSONAL=
NOTION_PORTFOLIO=
REVALIDATE=86400

# new
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NOTION_WEBHOOK_SECRET=    # for verifying webhook signatures
```
