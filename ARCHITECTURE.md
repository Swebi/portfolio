# Portfolio Architecture

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), deployed on Vercel |
| CMS | Notion (3 databases) |
| Media CDN | Cloudinary |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Animations | Framer Motion |
| Syntax highlighting | rehype-pretty-code + Shiki (`min-light` / `min-dark`) |
| Theme | next-themes, dark default |
| Page view counter | Upstash Redis (connected via Vercel marketplace) |

---

## Pages

### `/` — Home / Resume
- **Data:** `getPersonal()` + `getPortfolio()` + `getBlogPosts()` (4 most recent)
- **Revalidate:** `REVALIDATE` env var (default 86400s / 24h)
- **Sections:** Hero · Work · Education · Skills · About · Projects · Volunteering · Contact

### `/blog` — Blog listing
- **Data:** `getBlogPosts()` → metadata only, no block content
- **Revalidate:** 3600s

### `/blog/[slug]` — Blog post
- **Data:** `getPost(slug)` → full block content rendered to HTML
- **Revalidate:** 3600s
- `generateStaticParams()` pre-renders all published posts at build time

### `/opengraph-image` — OG image
- `next/og` ImageResponse, rendered at request time by Vercel Edge
- Grain texture via inline base64 SVG (no external fetch needed at render)

---

## Notion Databases

### Personal DB (`NOTION_PERSONAL`)
Single-row table. Read by `getPersonal()`.

| Property | Type | Notes |
|---|---|---|
| Name, Description | Title / Text | |
| Avatar | URL | Cloudinary URL (set via webhook) |
| Resume | URL | Cloudinary URL (PDF, set via webhook) |
| GitHub, LinkedIn, Instagram, Twitter, YouTube | URL | Social links |
| githubid | Text | Username for GitHub calendar |
| Skills | Multi-select | |
| Timezone | Text | IANA tz string, e.g. `Europe/London` |
| Map Image | URL | Cloudinary URL (set via webhook) |
| Map File | Files & media | User uploads here; webhook processes and clears |
| Avatar File | Files & media | Same pattern |
| Resume File | Files & media | Same pattern |

### Portfolio DB (`NOTION_PORTFOLIO`)
One row per work / education / project / volunteering entry.

| Property | Type | Notes |
|---|---|---|
| Title | Title | Company, school, or project name |
| Subtitle | Text | Role title or degree |
| Description | Text | |
| Category | Select | `Work` / `Education` / `Projects` / `Volunteering` |
| Active | Checkbox | Filters displayed entries |
| Start Date, End Date | Date | |
| Logo | URL | Cloudinary URL |
| Logo File | Files & media | Webhook uploads to Cloudinary → writes `Logo` |
| Media URL | URL | Cloudinary URL for project image or video |
| Media File | Files & media | Webhook uploads to Cloudinary → writes `Media URL` |
| URL, Source | URL | Live site / GitHub |
| Technologies | Multi-select | |
| Location | Text | |

### Blog DB (`NOTION_BLOG_DB`)
One row per post. Page body holds the actual content as Notion blocks.

| Property | Type | Notes |
|---|---|---|
| Title | Title | |
| Slug | Text | URL path segment |
| PublishedAt | Date | |
| Summary | Text | Shown in listing and meta description |
| Cover | URL | Cloudinary URL for OG image |
| Cover File | Files & media | Webhook uploads to Cloudinary → writes `Cover` |
| Status | Select | `Published` / `Draft` |

---

## Data Access Layer (`src/lib/notion.ts`)

All functions are wrapped in React `cache()`, which deduplicates calls within a single RSC render tree (e.g. `getPersonal()` is called by both `page.tsx` and `Navbar` but only hits Notion once per render).

### `getPersonal()`
Single Notion DB query. Returns flat object used by the home page and Navbar.

### `getPortfolio()`
Single Notion DB query. Returns array filtered/grouped at the page level into Work, Education, Projects, Volunteering.

### `getNotionBlogPosts()`
Single Notion DB query (published only, sorted by date descending). Returns metadata only — no block content is fetched here.

### `getNotionPostMarkdown(slug)`
Full blog post pipeline — the expensive path:

```
1. Notion DB query (find page by slug)
2. n2m.pageToMarkdown(pageId)         ← N Notion API calls, one per block type
3. resolveColumns(mdBlocks)            ← async: turns column_list blocks into flex HTML
4. n2m.toMarkdownString(resolved)      ← serialise to Markdown string
5. markdownToHTML(markdown)            ← remark-parse → remark-rehype → rehype-pretty-code → rehype-stringify
6. img regex: wrap standalone <img> in <span class="img-skeleton"> (fade-in + skeleton)
7. rewriteNotionImages(html)           ← replaces expiring Notion S3 URLs with Cloudinary URLs
```

**Column layout:** Notion `column_list` blocks are resolved in step 3. Each column's markdown is converted to HTML independently, images are wrapped with skeleton markup, and the columns are assembled into a `display:flex` div before being embedded in the final markdown. `remark-rehype` with `allowDangerousHtml: true` passes this raw HTML through untouched.

**Image proxying (custom `n2m` transformer):**
Notion inline image URLs are time-limited signed S3 URLs (`X-Amz-Signature`, ~1h TTL). Every fresh Notion API call returns new tokens, so the URL changes each render — breaking browser caching and causing image reloads on back-navigation.

Fix: a custom `notion-to-md` image transformer intercepts each image block during `pageToMarkdown`, before the URL touches the remark/rehype pipeline (which was stripping S3 query params). The raw Notion API URL is uploaded to Cloudinary and the permanent CDN URL is embedded in the markdown instead.

```
n2m image block transformer (raw Notion S3 URL)
  → toCdnUrl(notionUrl)
      1. Check module-level imgUrlCache Map (process-lifetime, survives ISR re-renders)
      2. On miss → cloudinary.api.resource(publicId)  ← fast check, no upload
      3. If 404 → fetch(notionUrl) → upload_stream to Cloudinary
      4. Cache result in imgUrlCache, return secure_url
  → embed Cloudinary URL in markdown as ![caption](cdnUrl)
```

`public_id` = `portfolio/blog/<SHA-256 of URL pathname, 24 hex chars>` — same image + same pathname = same Cloudinary URL, forever. New deployments hit step 2 (fast API check, no re-upload). Browser caches `res.cloudinary.com` URLs normally.

---

## Media Pipeline (Webhook)

`POST /api/notion-webhook` is triggered by Notion on any database page update.

```
Notion page updated
  → Notion POST /api/notion-webhook
  → Verify HMAC-SHA256 signature (NOTION_WEBHOOK_SECRET)
  → Fetch full page from Notion API
  → Build property-ID → name map (Notion sends IDs not names in updated_properties)
  → For each file property that has content:
      upload directly from Notion S3 URL to Cloudinary
      → write permanent URL back to Notion → clear file property
  → revalidatePath('/')
     revalidatePath('/blog')
     revalidatePath('/blog/[slug]', 'page')
```

File properties handled:

| Notion property | Writes to | Cloudinary resource_type |
|---|---|---|
| `Media File` | `Media URL` | `auto` (image or video) |
| `Logo File` | `Logo` | `image` |
| `Avatar File` | `Avatar` | `image` |
| `Resume File` | `Resume` | `raw` (PDF) |
| `Cover File` | `Cover` | `image` |
| `Map File` | `Map Image` | `image` |

---

## Page Views

`FooterStats` (client component) POSTs to `/api/views` on every page mount. The route calls `INCR portfolio:views` on Upstash Redis and returns the new count, which is displayed in the footer as `· X views`.

```
Client mount → POST /api/views → INCR portfolio:views (Upstash Redis) → { views: N } → footer
```

- Upstash Redis is connected through the Vercel marketplace (Storage → Upstash). Env vars are named `KV_REST_API_*` by that integration.
- If the env vars are absent (local dev without Redis), the stat is silently hidden.
- Uses the Upstash REST API directly (`fetch`) — no SDK dependency.

---

## Revalidation

| Trigger | Mechanism | Pages invalidated |
|---|---|---|
| Notion content edited | Webhook → `revalidatePath` | `/`, `/blog`, `/blog/[slug]` |
| Notion media uploaded | Webhook (after Cloudinary upload) | same |
| Fallback (webhook missed) | ISR `revalidate` | `/` = 86400s · `/blog*` = 3600s |

---

## Components

### Server Components
- **`Navbar`** — async server component; calls `getPersonal()` for resume URL and social links. Renders as a macOS-style dock.
- **`MapCard`** — `next/image` with Cloudinary map URL from Personal DB.
- All page components.

### Client Components
- **`ClockCard`** — SVG analog clock ticking via `requestAnimationFrame`. Timezone-aware using `Intl.DateTimeFormat`.
- **`FooterStats`** — displays build freshness, page load time (FCP or `domContentLoadedEventEnd`), and total page views fetched from `/api/views`.
- **`GithubCard`** — `react-github-calendar`. Theme-aware (reads `next-themes`). Fetches live from GitHub API client-side.
- **`CompanyResumeCard`** — work history grouped by company. Each role is individually expandable via a Framer Motion accordion.
- **`ProjectCard`** — card with click-to-open modal. Modal renders a `Safari` browser chrome mockup around the project image/video. Uses `createPortal` to render the modal at `document.body`.
- **`SectionLabel`** — fixed vertical label on left edge (desktop only). Scroll listener tracks which `section[id]` is in view; animates label transitions.
- **`CustomCursor`**, **`ClickEffect`**, **`ScrollProgress`** — UI polish; cursor replacement, click ripple, top scroll bar.
- **`ModeToggle`** — light/dark switch.

### Animation primitives
- `BlurFade` / `BlurFadeText` — staggered entrance animation used on every section.
- `TextScramble` — character-scramble reveal on hero heading.
- `Magnetic` — magnetic hover pull on inline links.
- `Dock` / `DockIcon` — macOS dock magnification.

---

## Image Loading Pattern (Blog)

Blog images arrive as plain `<img>` tags from the Notion → Markdown → HTML pipeline. Since content is injected via `dangerouslySetInnerHTML`, React components like `next/image` can't be used here.

Instead, each `<img>` is wrapped at render time:

```html
<span class="img-skeleton">
  <img
    loading="lazy"
    decoding="async"
    onload="this.style.opacity='1'; this.parentElement.classList.add('img-loaded')"
    style="opacity:0; transition:opacity 0.4s ease; max-height:600px; ..."
    src="https://res.cloudinary.com/..."
  >
</span>
```

`.img-skeleton` in `globals.css` shows a shimmer placeholder (`--muted` + `--muted-foreground` CSS variables, adapts to dark/light mode). On image load: `img-loaded` class removes the shimmer and `min-height`, image fades in. Prevents both progressive-render banding and layout shift.

---

## Unused / Legacy

| File | Status |
|---|---|
| `content/hello-world.mdx` | Not wired up — Notion is the blog CMS |
| `src/components/mdx.tsx` | Unused — leftover from MDX-based blog era |
| `src/components/location-card.tsx` | Unused — Google Maps iframe, not referenced in any page |

---

## Environment Variables

```bash
NOTION_TOKEN              # Notion integration token
NOTION_PERSONAL           # Notion DB ID — personal info
NOTION_PORTFOLIO          # Notion DB ID — portfolio items
NOTION_BLOG_DB            # Notion DB ID — blog posts
NOTION_WEBHOOK_SECRET     # HMAC secret for webhook signature verification
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
REVALIDATE                # ISR interval for home page (default: 86400)
KV_REST_API_URL           # Upstash Redis REST URL (via Vercel → Storage → Upstash)
KV_REST_API_TOKEN         # Upstash Redis auth token
```
