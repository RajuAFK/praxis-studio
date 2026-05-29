# Deploy to Hostinger Premium

Hostinger Premium is shared hosting (Apache/LiteSpeed + PHP). It cannot run
Node.js, so we serve this site as a **statically exported** Next.js build.
The flow is:

```
┌─────────────────┐  npm run build  ┌──────────┐  upload  ┌────────────────┐
│  Source (this   │ ──────────────▶ │  out/    │ ───────▶ │  public_html/  │
│  repo, branch   │   produces      │  folder  │   via    │  on Hostinger  │
│  `main`)        │   static HTML   │          │   Git    │                │
└─────────────────┘                 └──────────┘  or FTP  └────────────────┘
```

Two paths to push the build to Hostinger:

- **Path A · Manual SFTP / File Manager.** Easiest first time. ~10 minutes.
- **Path B · Git auto-deploy.** Hostinger watches a `deploy` branch and pulls
  on every push. ~20-minute one-time setup, then each release is `npm run deploy`.

Pick **A** for the first launch. Switch to **B** once you've redeployed twice.

---

## One-time prep (do this once, before either path)

### 1. Point a custom domain at Hostinger

Skip if you're using the default `*.hostingersite.com` URL.

1. Hostinger panel → **Domains → Add domain** → enter `praxis.photo` (or whatever).
2. Add the domain's nameservers at your registrar (Hostinger shows them).
3. Wait for propagation (anywhere from 10 min to 12 h).

### 2. Configure Cloudflare R2 CORS

Already done — but verify in Cloudflare → R2 → `praxivision` bucket → **Settings → CORS Policy**:

```json
[
  {
    "AllowedOrigins": ["https://praxis.photo", "https://www.praxis.photo", "https://*.hostingersite.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `praxis.photo` with the actual production domain. If you've left
`AllowedOrigins: ["*"]` from initial setup, that already works — only tighten
it after launch.

### 3. Local environment

```bash
git clone https://github.com/RajuAFK/praxis-studio.git
cd praxis-studio
cp .env.example .env.local
npm install
```

Make sure `public/portfolio` resolves to the studio media tree on your
machine (Windows junction or symlink to `C:/Users/USER/Desktop/Praxivision pvt ltd/Portfolio`).
If `npm run build` reports zero photography frames, that junction is missing.

---

## Path A — Manual upload (recommended for first launch)

### Build

```bash
npm run build
```

This writes a self-contained static site to `out/`. Verify it locally:

```bash
npx serve out
# Open http://localhost:3000 in a browser.
```

Click into `/archive/photography/industrial`, open a lightbox, scroll past the
client grid. If everything looks right, proceed.

### Upload

1. Hostinger panel → **Files → File Manager**.
2. Navigate into `public_html/`.
3. **Delete the default `index.html` / `default.php` / `.htaccess`** that
   Hostinger ships with a fresh install. (Keep `cgi-bin/` if present.)
4. Drag the **contents** of your local `out/` folder into `public_html/`.
   Drop them at the root — not inside a sub-folder.
5. Wait for the upload to finish (a few hundred files; should take 2–5 minutes).

### Add the SPA-friendly `.htaccess`

Static Next exports use trailing-slash directory URLs (e.g. `/archive/`).
Apache needs a small rule so direct navigation to a deep URL maps cleanly.

In `public_html/`, create a file named `.htaccess` with this content:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Serve .html when a file with .html exists for the requested path.
# e.g. /studio → /studio.html (Next static export emits both styles)
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+?)/?$ $1.html [L]

# Long-cache static assets (the _next folder is fingerprinted)
<FilesMatch "\.(?:js|css|woff2?|ttf|otf|eot|jpg|jpeg|png|webp|avif|gif|svg|ico)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Short-cache HTML so updates ship fast
<FilesMatch "\.html$">
  Header set Cache-Control "public, max-age=300, must-revalidate"
</FilesMatch>

# Custom 404 page (Next exports app/not-found to out/404.html)
ErrorDocument 404 /404.html
```

Save it. Browse to your domain and click around.

### Subsequent updates

Repeat the same steps: rebuild locally, delete old files in `public_html`,
upload the new `out/` contents. Hostinger's File Manager has a "Select all →
Delete" shortcut for the cleanup.

---

## Path B — Git auto-deploy (recommended once you've launched)

We push the built `out/` folder to a separate `deploy` branch. Hostinger
auto-pulls that branch into `public_html/`.

### One-time GitHub setup

1. **Add the `deploy` npm script.** This is already in your `package.json` (we add it below). It builds and force-pushes `out/` to the `deploy` branch.
2. **Create the empty `deploy` branch on GitHub:**
   ```bash
   git checkout --orphan deploy
   git rm -rf .
   echo "deploy branch — built artifacts only" > README.md
   git add README.md
   git commit -m "Initial deploy branch"
   git push -u origin deploy
   git checkout main
   ```

### One-time Hostinger setup

1. Hostinger panel → **Websites → praxis.photo → Advanced → Git**.
2. Click **Create or use existing repository** → paste:
   - **Repository URL:** `https://github.com/RajuAFK/praxis-studio.git`
   - **Branch:** `deploy`
   - **Install path:** `/public_html`
   - **Auto deployment:** enabled
3. Hostinger generates a webhook URL — copy it.
4. **Add the webhook to GitHub:** `Settings → Webhooks → Add webhook` →
   paste the URL, set content type to `application/json`, leave secret blank,
   choose "Just the push event".

After this, every push to `deploy` triggers Hostinger to rsync the branch
contents into `public_html/`.

### Subsequent updates

```bash
# from main, after committing your changes
npm run deploy
```

The script builds → publishes `out/` to the `deploy` branch → GitHub fires the
webhook → Hostinger redeploys. Your changes are live in ~30 seconds.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `archive/photography/<x>` shows zero frames | `public/portfolio` junction missing on the build machine | Re-create the junction or symlink; rebuild |
| Images broken, browser shows mixed-content warnings | Domain doesn't have HTTPS yet | Hostinger panel → **Security → SSL** → install free SSL (Let's Encrypt) |
| 404 on `/studio` but `/studio/` works | `.htaccess` not uploaded or got disabled | Re-upload it, ensure no `.htaccess.txt` extension |
| 3D models silently don't load | R2 CORS blocks your domain | Add your domain to the bucket's `AllowedOrigins` |
| Site loads but VR / gigapan iframes show empty placeholder | Working as intended — they're thumbnail-first. Click "Load this content" |

---

## Rotating the GitHub PAT

The PAT that pushed this repo is logged in the chat history that set it up.
Rotate it now:

1. https://github.com/settings/tokens → revoke the existing token.
2. Generate a new fine-grained token, scoped to this repo only, with
   **Contents: Read and Write** + **Metadata: Read-only**.
3. Use it next time you push from a new machine. The current dev machine's
   git config already cached credentials, so day-to-day pushes continue to work.
