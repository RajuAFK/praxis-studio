# Praxis Studio

Portfolio site for Praxis Studio — a department of Praxivision Pvt Ltd
specialising in industrial photography, gigapixel imagery, 360° tours,
close-range photogrammetry, and gaussian splat captures.

Built with Next.js 15 (App Router) and statically exported for shared hosting.
All heavyweight media (photos, gigapans, VR tours, GLB models) is served from
a Cloudflare R2 bucket; the deployed `out/` folder is just HTML, CSS, and a
tiny bundle of client-side JavaScript.

## Project layout

```
app/                     Next.js App Router pages
components/              React components
lib/                     portfolio.ts builds Work[] from public/portfolio
                         r2.ts resolves plate IDs to R2 URLs
public/
  category-covers/       Per-category landing covers
  plates/                Hero plates + the founder portrait
  portfolio/             ← Windows junction → studio media tree
                           (ignored by git; only needed at BUILD time
                            so portfolio.ts can enumerate works)
```

## Local development

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# (the default R2 URL already points at the production bucket)

# 3. Make sure public/portfolio resolves to the studio media tree.
#    On the studio's Windows machine this is a `mklink /J` junction. On any
#    other machine you'll need to either point a junction at the source folder
#    or accept that archive pages render with zero works.

# 4. Run
npm run dev   # http://localhost:3000
```

## Production build (for Hostinger upload)

```bash
npm run build       # writes ./out/
# Upload the *contents* of out/ to your Hostinger public_html folder.
```

See [DEPLOY-HOSTINGER.md](./DEPLOY-HOSTINGER.md) for the full deploy plan.

## Media pipeline

All media uploads / thumbnails are managed from a sibling project at
`../../praxivision/` (separate repo). Its `scripts/upload-to-r2.mjs` is
idempotent — re-running it only ships new / changed files.
