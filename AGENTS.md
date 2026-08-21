# AGENTS

Internal guidelines for maintaining and extending the Tabela do INSS 2026 site.

This repo is an Astro static site deployed via Cloudflare Pages (git integration on `master`). Content is file‑based (Markdown) and route generation is static.

## Stack & Structure
- Static site: Astro 5
- Deploy: Cloudflare Pages, integração git — todo push em `master` gera um deploy
- Rebuild agendado: `.github/workflows/scheduled-rebuild.yml` (ver `.github/AGENDAMENTO.md`)
- Content: `src/content/blog/*.md` (collection configured in `src/content.config.js`)
- Pages: `src/pages/*.astro`
- Layouts/Components: `src/layouts`, `src/components`

## Blog Scheduling Rules
- Visibility: posts are listed and built only when `pubDate <= now`.
  - Implemented in:
    - `src/pages/blog/index.astro` (filters future posts)
    - `src/pages/blog/[...slug].astro` (does not create static routes for future posts)
- Cron build: 09:00 UTC (06:00 GMT‑3) e 11:00 UTC (08:00 GMT‑3).
  - Config: `.github/workflows/scheduled-rebuild.yml` → `schedule: '0 9 * * *'` e `'0 11 * * *'`
  - O workflow dispara um Deploy Hook da Cloudflare Pages; requer o secret
    `CLOUDFLARE_DEPLOY_HOOK` (passo manual em `.github/AGENDAMENTO.md`).
  - O deploy também roda em todo push e aceita disparo manual (workflow_dispatch).
- How to schedule a post:
  1) Create a new file in `src/content/blog/` with frontmatter including `title`, `description`, `pubDate`, optional `updatedDate`, `tags`, and (optionally) `image` and `imageAlt`.
  2) Set `pubDate` to a future date (UTC) you want the article to go live. It will appear after the next scheduled build at 10:00 UTC (07:00 GMT‑3).
  3) If you include a time in `pubDate`, ensure it is ≤ 11:00 UTC for same‑day publish (convenção do repo: `T10:00:00.000Z`).
- Weekly cadence:
  - We publish one post per week. To queue content, set `pubDate` to weekly intervals (prefer morning UTC to match cron).

## Images & Open Graph Rules
- Default OG image:
  - Path: `/og-image.jpg` (place in `public/`)
  - Recommended: 1200×630 px, JPG quality 80–85, ≤ 2–5 MB (aim 100–400 KB), no EXIF.
  - The layout includes Open Graph meta with width, height, and `og:image:alt`.
- Per‑post images:
  - Add in frontmatter: `image: '/blog/og/<slug>.jpg'` and optional `imageAlt`.
  - Prefer absolute URLs if hosting on CDN.
- Hosting options:
  - Local: put assets in `public/` (served by Cloudflare’s CDN).
  - CDN (recommended for scale): Cloudflare R2 with Custom Domain (e.g., `https://img.tabeladoinss.com.br`).
    - Folders: `og/` for site‑wide OGs, `blog/og/` for post thumbnails.
    - Headers per object: `Content-Type: image/jpeg` (PNG/SVG if needed) and `Cache-Control: public, max-age=31536000, immutable`.
    - Use absolute URLs in frontmatter when served via CDN.
- Current example asset:
  - `public/og-image-example.svg` (template 1200×630). Export to JPG for real use.

## SEO & Social Metadata
- `src/layouts/Layout.astro` sets:
  - Title, description, canonical, robots
  - `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`
  - Twitter: `summary_large_image`
- `image`/`imageAlt` can be provided per page/post; otherwise, defaults are used.

## Cloudflare Pages & Limits
- Per file push limit (Git): 100 MB
- Arquivo individual servido pela Pages: ≤ 25 MB
- Builds: cota mensal do plano (o rebuild agendado consome ~60/mês)
- Do not rely on Git LFS for images to be served by Pages.

## Authoring a New Post (checklist)
1) Create `src/content/blog/<slug>.md` with frontmatter:
   - `title`, `description`, `pubDate`, `tags`
   - Optional: `image` (absolute or `/blog/og/<slug>.jpg`) and `imageAlt`
2) If using local assets, add images to `public/blog/og/`.
3) Keep OG images at 1200×630, JPG 80–85% (100–400 KB). Short, descriptive `imageAlt`.
4) Internal links: prefer absolute paths (`/tabela-codigos-do-inss`, `/blog`).
5) Validate build locally: `npm run build`.
6) On schedule, the daily cron will publish when `pubDate <= now`.

## Adjusting the Cron
- Open `.github/workflows/scheduled-rebuild.yml` and update the `cron` lines.
- Example: daily 07:00 GMT‑3 is `0 10 * * *` (10:00 UTC).
- Lembre: o cron não constrói nada por si — ele chama o Deploy Hook da
  Cloudflare. Se o secret `CLOUDFLARE_DEPLOY_HOOK` sumir, o agendamento para.

## Optional: CDN Variable
- If/when using a dedicated CDN domain for images, consider introducing an `ASSET_BASE_URL` in the code to build absolute OG URLs and fall back to local `public/` when unset.
- Current layout already computes absolute `og:image` using the configured `site` (see `astro.config.mjs`).

