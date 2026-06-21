# Portfolio

A dynamic and easily maintainable portfolio website powered by Notion as a CMS. The portfolio fetches data from a Notion database and renders it seamlessly using Next.js.

Built on top of  https://magicui.design/docs/templates/portfolio

## App Preview
<img width="1440" height="787" alt="image" src="https://github.com/user-attachments/assets/9cd473dd-772c-4b5b-96fd-f77095d3c68b" />

<img width="1440" height="791" alt="image" src="https://github.com/user-attachments/assets/3433ca3a-393b-4c43-9f3b-39753d5006f0" />

<img width="1440" height="791" alt="image" src="https://github.com/user-attachments/assets/197533a9-40a2-4a9a-bc8f-9b6668d3e05f" />


Notion CMS

![image](https://github.com/user-attachments/assets/fd46cfab-9fdb-4178-a41f-c9d0a2a6e8a9)

## Tech Stack

[Architecture →](ARCHITECTURE.md)

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), deployed on Vercel |
| UI | Magic UI / shadcn/ui (Radix primitives) |
| CMS | Notion (3 databases) |
| Media CDN | Cloudinary |
| Animations | Framer Motion |
| Syntax highlighting | rehype-pretty-code + Shiki |
| Page view counter | Upstash Redis (via Vercel marketplace) |

### **Deployment**

- **Frontend:** Vercel

## Notion Setup

1. Create a new Notion integration at https://www.notion.so/profile/integrations with any name and type **Internal**.

![image](https://github.com/user-attachments/assets/06ab6490-4ca1-4628-963f-241809c56619)

2. Create three Notion databases using the schemas below.

3. In each database, connect your integration via the **...** menu → **Connect to**.

![image](https://github.com/user-attachments/assets/cbcfabe3-9f47-49be-8810-7282dbe8bf35)

4. Copy the integration secret and each database ID into your `.env`.

To get a database ID, click **Copy link** on the database. The characters before `?` in the URL are the ID:

```
www.notion.so/suhayba/19c97a45977480d6b3ffd537e3ca13b1?v=...
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                       This is your database ID
```

5. *(Optional)* Set up Notion automations to POST to `/api/notion-webhook` for automatic Cloudinary media uploads on file property changes.

## Database Schemas

### Personal DB (`NOTION_PERSONAL`)

Single-row table holding your personal info.

| Property | Type | Notes |
|---|---|---|
| Name | Title | |
| Description | Text | |
| Avatar | URL | Cloudinary URL (set via webhook) |
| Resume | URL | Cloudinary URL for PDF (set via webhook) |
| GitHub | URL | |
| LinkedIn | URL | |
| Instagram | URL | |
| Twitter | URL | |
| YouTube | URL | |
| githubid | Text | Username for the GitHub contribution calendar |
| Skills | Multi-select | |
| Timezone | Text | IANA tz string, e.g. `Europe/London` |
| Map Image | URL | Cloudinary URL (set via webhook) |
| Map File | Files & media | Upload here; webhook processes and clears |
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
| Active | Checkbox | Only checked rows are displayed |
| Start Date | Date | |
| End Date | Date | |
| Logo | URL | Cloudinary URL |
| Logo File | Files & media | Webhook uploads to Cloudinary → writes `Logo` |
| Media URL | URL | Cloudinary URL for project image or video |
| Media File | Files & media | Webhook uploads to Cloudinary → writes `Media URL` |
| URL | URL | Live site link |
| Source | URL | GitHub / source link |
| Technologies | Multi-select | |
| Location | Text | |

### Blog DB (`NOTION_BLOG_DB`)

One row per post. Page body holds the actual content as Notion blocks.

| Property | Type | Notes |
|---|---|---|
| Title | Title | |
| Slug | Text | URL path segment, e.g. `my-first-post` |
| PublishedAt | Date | |
| Summary | Text | Shown in listing and meta description |
| Cover | URL | Cloudinary URL for OG image |
| Cover File | Files & media | Webhook uploads to Cloudinary → writes `Cover` |
| Status | Select | `Published` / `Draft` |

## Environment Variables

```env
# Notion
NOTION_TOKEN=              # Integration secret
NOTION_PERSONAL=           # Personal DB ID
NOTION_PORTFOLIO=          # Portfolio DB ID
NOTION_BLOG_DB=            # Blog DB ID
NOTION_WEBHOOK_SECRET=     # HMAC secret for webhook signature verification

# Cloudinary — required for the media webhook (/api/notion-webhook)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ISR
REVALIDATE=86400           # Home page revalidation interval in seconds

# Upstash Redis — required for the page view counter (via Vercel → Storage → Upstash)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
KV_URL=
REDIS_URL=
```

## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/swebi/portfolio.git
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Set up environment variables in a `.env` file (see above).
4. Start the dev server:
   ```sh
   pnpm dev
   ```
