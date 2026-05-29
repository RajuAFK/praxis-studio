# R2 Upload — Praxis Studio Portfolio

**Task for the agent:** Upload the studio's local `Portfolio` folder to a Cloudflare R2 bucket using the S3-compatible API, preserving the exact directory layout, and then produce a JSON manifest of public URLs that the Praxis Studio site will read from.

You are operating against a real production media set. **Do not rename files, flatten folders, or skip files.** Several viewers (pano2vr HTML players for VRs and gigapixels) load sibling resources by relative path — if you change a folder name or drop a file, those viewers break silently in the browser.

---

## 0 · Where things live

| Thing | Path |
|---|---|
| Local media root | `C:\Users\USER\Desktop\Praxivision pvt ltd\Portfolio` |
| Site project root | `C:\Users\USER\Desktop\claude-workspace\projects\new-praxis-site` |
| Scripts go in | `<site root>\scripts\` |
| Manifest output | `<site root>\docs\r2-manifest.json` |
| Env var to set | `<site root>\.env.local` → `NEXT_PUBLIC_MEDIA_BASE=…` |

**Top-level folders inside `Portfolio` (uppercase + spaces preserved):**

```
Portfolio/
├── 3D Models/          ← .glb files, one per work
├── Gigapans/           ← pano2vr HTML viewers + Paintings subfolder
├── Photography/        ← 13 subfolders of JPGs
└── Praxis VRs/         ← pano2vr HTML viewers + Cars_360 Vr + Thumbnails
```

The site already consumes URLs of the form **`/portfolio/{TopLevel}/{Subfolder}/{File}`**.
When `NEXT_PUBLIC_MEDIA_BASE` is unset → served from a local junction.
When set → resolves to `{base}/portfolio/{TopLevel}/{Subfolder}/{File}`.

**Your R2 layout must mirror the local layout exactly.**

---

## 1 · Cloudflare R2 setup

These steps are one-time, done in the Cloudflare dashboard. If the user has already done them, skip to §2 and reuse the existing credentials.

1. **Create a bucket.** Cloudflare Dashboard → R2 → "Create bucket".
   - Name: `praxivision-portfolio` (suggested)
   - Location hint: closest region to Hyderabad (likely APAC)
2. **Enable public access.** Bucket → Settings → "Public Access" → enable the
   managed **r2.dev** subdomain. You'll get a URL like
   `https://pub-<hash>.r2.dev`. Note it — this becomes `NEXT_PUBLIC_MEDIA_BASE`.
   - Alternative for production: connect a custom domain (e.g. `media.praxis.photo`).
3. **CORS.** Bucket → Settings → CORS Policy. Paste:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["Content-Length", "Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   Tighten `AllowedOrigins` to the production domain after launch if desired.
4. **Create API credentials.** R2 → Manage R2 API Tokens → "Create API token".
   - Permission: **Object Read & Write** (you'll demote to read-only after the upload if you want)
   - Scope: this bucket only
   - Save the credentials immediately. You need:
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_ACCOUNT_ID` (visible in the URL of any R2 page)
     - `R2_BUCKET` (`praxivision-portfolio`)
     - `R2_PUBLIC_BASE` (the `https://pub-<hash>.r2.dev` URL)

Put all five into a file at the **site project root** named `.env.upload`
(distinct from `.env.local` — this one is only for the upload script and
should never be committed):

```
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=praxivision-portfolio
R2_PUBLIC_BASE=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

Add `/.env.upload` to `.gitignore` if it isn't covered already.

---

## 2 · Install upload dependencies

From the site project root:

```bash
npm install --save-dev @aws-sdk/client-s3 @aws-sdk/lib-storage mime-types dotenv
```

(All four are dev-only — they don't ship with the site.)

---

## 3 · Upload script

Create **`<site root>/scripts/upload-to-r2.mjs`** with the following contents.
The script:

- Walks the entire `Portfolio` tree recursively
- Uploads every file with its original relative path preserved under the
  `portfolio/` prefix in R2
- Skips known cruft (`Thumbs.db`, `.DS_Store`, dotfiles)
- Detects the correct `Content-Type` per file extension (critical: HTML
  viewers must serve as `text/html`, GLB as `model/gltf-binary`, etc.)
- Uses concurrent uploads (8 in flight) with a progress counter
- Is **idempotent** — if a file already exists with the same size, it is
  skipped, so re-running after a partial upload picks up where it left off

```js
// scripts/upload-to-r2.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import mime from "mime-types";
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve config from .env.upload (preferred) or process.env
const envPath = path.resolve(__dirname, "..", ".env.upload");
if (fs.existsSync(envPath)) {
  const dotenv = await import("dotenv");
  dotenv.config({ path: envPath, override: false });
}

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE,
} = process.env;

for (const k of [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE",
]) {
  if (!process.env[k]) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

// CLI: pass --source=... to override, otherwise use the local default
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const SOURCE_ROOT =
  args.source ||
  "C:/Users/USER/Desktop/Praxivision pvt ltd/Portfolio";
const PREFIX = "portfolio"; // S3 key prefix — matches the site's URL convention
const CONCURRENCY = 8;
const DRY_RUN = !!args["dry-run"];

if (!fs.existsSync(SOURCE_ROOT)) {
  console.error(`Source folder not found: ${SOURCE_ROOT}`);
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const SKIP_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (SKIP_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function toKey(absPath) {
  // Convert backslashes to forward slashes, preserve case and spaces
  const rel = path
    .relative(SOURCE_ROOT, absPath)
    .split(path.sep)
    .join("/");
  return `${PREFIX}/${rel}`;
}

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  // mime-types misses some studio formats — override
  if (ext === ".glb") return "model/gltf-binary";
  if (ext === ".gltf") return "model/gltf+json";
  if (ext === ".ply") return "application/octet-stream";
  return mime.lookup(file) || "application/octet-stream";
}

async function existsWithSameSize(key, size) {
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );
    return Number(head.ContentLength) === size;
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404) return false;
    throw e;
  }
}

async function uploadOne(absPath) {
  const key = toKey(absPath);
  const stat = fs.statSync(absPath);
  if (await existsWithSameSize(key, stat.size)) {
    return { key, status: "skipped", size: stat.size };
  }
  if (DRY_RUN) return { key, status: "would-upload", size: stat.size };

  const body = fs.createReadStream(absPath);
  const ct = contentTypeFor(absPath);

  // lib-storage handles multipart for big files (>5MB) automatically
  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: ct,
      CacheControl: "public, max-age=31536000, immutable",
    },
    queueSize: 4,
    partSize: 8 * 1024 * 1024,
  });
  await uploader.done();
  return { key, status: "uploaded", size: stat.size, contentType: ct };
}

async function main() {
  console.log(`Source : ${SOURCE_ROOT}`);
  console.log(`Bucket : ${R2_BUCKET}`);
  console.log(`Prefix : ${PREFIX}/`);
  console.log(`Mode   : ${DRY_RUN ? "DRY-RUN" : "LIVE"}`);
  console.log("");

  const files = [...walk(SOURCE_ROOT)];
  console.log(`Found ${files.length} files. Starting upload...`);
  console.log("");

  let done = 0;
  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  const errors = [];

  const queue = [...files];
  async function worker(id) {
    while (queue.length) {
      const file = queue.shift();
      if (!file) return;
      try {
        const r = await uploadOne(file);
        if (r.status === "uploaded" || r.status === "would-upload") uploaded++;
        else skipped++;
        bytes += r.size;
        done++;
        if (done % 20 === 0 || done === files.length) {
          process.stdout.write(
            `\r[${done}/${files.length}] uploaded=${uploaded} skipped=${skipped} (${(bytes / 1024 / 1024).toFixed(1)} MB)`
          );
        }
      } catch (e) {
        errors.push({ file, message: e.message });
        console.error(`\nFAIL ${file}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  console.log("\n");
  console.log(`Done. uploaded=${uploaded}, skipped=${skipped}, errors=${errors.length}`);
  if (errors.length) {
    console.log("");
    console.log("Errors:");
    for (const e of errors) console.log(`  - ${e.file}: ${e.message}`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### Run it

```bash
# Dry run first — lists everything that would upload without actually pushing
node scripts/upload-to-r2.mjs --dry-run

# Live upload
node scripts/upload-to-r2.mjs

# Override source (rare, only if the user moved the folder)
node scripts/upload-to-r2.mjs --source="D:/some/other/Portfolio"
```

Expect ~5.5 GB on the wire. On a typical home connection in Hyderabad, plan
30–90 minutes. The script is resumable — if it dies mid-way, just run it
again and the existing-size check skips what's already up there.

---

## 4 · Generate the URL manifest

Once the upload succeeds, produce a JSON manifest that lists, per work, the
public URL to embed. Create **`<site root>/scripts/build-r2-manifest.mjs`**:

```js
// scripts/build-r2-manifest.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.upload");
if (fs.existsSync(envPath)) {
  const dotenv = await import("dotenv");
  dotenv.config({ path: envPath, override: false });
}
const { R2_PUBLIC_BASE } = process.env;
if (!R2_PUBLIC_BASE) {
  console.error("Missing R2_PUBLIC_BASE in .env.upload");
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const SOURCE_ROOT =
  args.source || "C:/Users/USER/Desktop/Praxivision pvt ltd/Portfolio";
const PREFIX = "portfolio";

function publicUrl(absPath) {
  const rel = path
    .relative(SOURCE_ROOT, absPath)
    .split(path.sep)
    .map(encodeURIComponent)
    .join("/");
  return `${R2_PUBLIC_BASE.replace(/\/$/, "")}/${PREFIX}/${rel}`;
}

function listDirs(p) {
  return fs.existsSync(p)
    ? fs
        .readdirSync(p, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name)
        .sort()
    : [];
}

function listFiles(p) {
  return fs.existsSync(p)
    ? fs
        .readdirSync(p, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name !== "Thumbs.db" && !d.name.startsWith("."))
        .map((d) => d.name)
        .sort()
    : [];
}

function findHtml(dir, folderName) {
  const files = listFiles(dir);
  const norm = folderName.toLowerCase();
  const preferred = files.find(
    (f) =>
      f.toLowerCase() === `${norm}.html` ||
      f.toLowerCase() === `${norm.replace(/_/g, "")}.html`
  );
  return preferred ?? files.find((f) => f.toLowerCase().endsWith(".html")) ?? null;
}

function findGlb(dir) {
  return listFiles(dir).find((f) => f.toLowerCase().endsWith(".glb")) ?? null;
}

const out = {
  generatedAt: new Date().toISOString(),
  base: R2_PUBLIC_BASE,
  works: { photography: [], vr: [], gigapixel: [], "3d": [] },
};

// Photography — gallery covers + image count per sub-category
for (const sub of listDirs(path.join(SOURCE_ROOT, "Photography"))) {
  const dir = path.join(SOURCE_ROOT, "Photography", sub);
  const imgs = listFiles(dir).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f)
  );
  out.works.photography.push({
    title: sub,
    cover: imgs[0] ? publicUrl(path.join(dir, imgs[0])) : null,
    imageCount: imgs.length,
    gallery: imgs.map((f) => publicUrl(path.join(dir, f))),
  });
}

// VRs — iframe URL per tour
const vrRoot = path.join(SOURCE_ROOT, "Praxis VRs");
for (const sub of listDirs(vrRoot)) {
  if (sub === "Cars_360 Vr" || sub === "Thumbnails for Web Gallereis") continue;
  const dir = path.join(vrRoot, sub);
  const html = findHtml(dir, sub);
  if (!html) continue;
  out.works.vr.push({
    title: sub,
    iframe: publicUrl(path.join(dir, html)),
  });
}
// Cars subfolders
const carsRoot = path.join(vrRoot, "Cars_360 Vr");
for (const brand of listDirs(carsRoot)) {
  if (brand.toLowerCase().includes("thumb")) continue;
  const brandDir = path.join(carsRoot, brand);
  const models = listDirs(brandDir);
  if (models.length === 0) {
    const html = findHtml(brandDir, brand);
    if (html) {
      out.works.vr.push({
        title: brand,
        group: "Cars",
        iframe: publicUrl(path.join(brandDir, html)),
      });
    }
    continue;
  }
  for (const model of models) {
    const modelDir = path.join(brandDir, model);
    const html = findHtml(modelDir, model);
    if (!html) continue;
    out.works.vr.push({
      title: model,
      group: `Cars · ${brand}`,
      iframe: publicUrl(path.join(modelDir, html)),
    });
  }
}

// Gigapans
const gigaRoot = path.join(SOURCE_ROOT, "Gigapans");
for (const sub of listDirs(gigaRoot)) {
  const dir = path.join(gigaRoot, sub);
  const html = findHtml(dir, sub);
  if (html) {
    out.works.gigapixel.push({
      title: sub,
      iframe: publicUrl(path.join(dir, html)),
    });
    continue;
  }
  // Paintings folder — each subfolder is its own work
  for (const child of listDirs(dir)) {
    const childDir = path.join(dir, child);
    const childHtml = findHtml(childDir, child);
    if (!childHtml) continue;
    out.works.gigapixel.push({
      title: child,
      group: sub,
      iframe: publicUrl(path.join(childDir, childHtml)),
    });
  }
}

// 3D Models
const modelRoot = path.join(SOURCE_ROOT, "3D Models");
for (const sub of listDirs(modelRoot)) {
  const dir = path.join(modelRoot, sub);
  const glb = findGlb(dir);
  if (!glb) continue;
  out.works["3d"].push({
    title: sub,
    model: publicUrl(path.join(dir, glb)),
  });
}

const dest = path.resolve(__dirname, "..", "docs", "r2-manifest.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`Wrote ${dest}`);
console.log(
  `  photography: ${out.works.photography.length}, vr: ${out.works.vr.length}, gigapixel: ${out.works.gigapixel.length}, 3d: ${out.works["3d"].length}`
);
```

Run it after the upload finishes:

```bash
node scripts/build-r2-manifest.mjs
```

This writes `docs/r2-manifest.json`. Hand that file back to the user — it
contains every public URL the site will need.

---

## 5 · Switch the site over to R2

In **`<site root>/.env.local`** (create if it doesn't exist):

```
NEXT_PUBLIC_MEDIA_BASE=https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

(Use the same value as `R2_PUBLIC_BASE` from `.env.upload`.)

Restart the dev server (`npm run dev`). Every URL the site emits will
silently switch from `/portfolio/...` → `https://pub-…r2.dev/portfolio/...`.
No code changes are required — `lib/portfolio.ts` already reads this env var.

When the switch is verified working, you can safely:

- Delete the local junction:
  `rmdir "<site root>\public\portfolio"` (it's a junction; this does not
  delete the underlying Portfolio folder).
- Commit `r2-manifest.json` to the repo so the team has a record of every
  embed URL.

---

## 6 · Verification checklist

After the upload + env switch, hit the dev server and confirm:

1. **`/archive`** still shows real category cover thumbnails (now from R2).
2. **`/archive/photography/industrial`** — all 87 frames load from `pub-….r2.dev`.
3. **`/archive/vr/king-koti`** (or any VR tour) — iframe loads the pano2vr
   viewer **and** the panorama tiles render (means relative paths inside
   the HTML resolved correctly — proves you preserved the folder structure).
4. **`/archive/gigapixel/golconda-gigapan`** — viewer loads + zoom/pan works.
5. **`/archive/3d/saranath-sthupa`** — the `<model-viewer>` renders the
   .glb (Content-Type must be `model/gltf-binary`).
6. **Browser DevTools → Network tab** — every portfolio request is `200` on
   the R2 domain. No `403` / `404` / mixed-content warnings.

If any pano2vr viewer renders the controls but the panorama image stays
black: the issue is almost always a missing `tiles/` subfolder or a
case-sensitivity mismatch. Re-run `node scripts/upload-to-r2.mjs` (it'll
catch anything missed) and check the offending key in the R2 dashboard.

---

## 7 · Notes & gotchas

- **Case sensitivity.** R2 is case-sensitive. Local Windows is not. Always
  preserve the exact casing from the source folder. The walk-and-upload
  script does this — don't be tempted to `.toLowerCase()` keys.
- **Spaces in folder names** (`Praxis VRs`, `3D Models`, `Products & Tabletop`)
  are fine; the manifest URL-encodes them. Don't rename.
- **Bandwidth.** The upload is one-time. R2 egress is free to the public
  internet, so serving from R2 in production costs only storage (cheap).
- **Custom domain (later).** When the user wires `media.praxis.photo` →
  R2 bucket via the Cloudflare dashboard, just change
  `NEXT_PUBLIC_MEDIA_BASE` to `https://media.praxis.photo`. Nothing else
  in the site needs to change.
- **Re-uploading after edits.** The script's idempotent check uses *size*
  only, not hash. If you edit a file in place and the size happens to be
  identical, add `--force` handling or delete the object from R2 first.
  (Out of scope for the initial upload.)

---

## Deliverable to the user

When you finish:

1. Confirm the upload count vs local file count (should be equal or off by
   only the skipped-cruft files).
2. Hand them:
   - `docs/r2-manifest.json` (the URL list)
   - The exact value of `NEXT_PUBLIC_MEDIA_BASE`
   - A one-line summary of what was uploaded (file count, total GB)
3. Tell them to set the env var, restart the dev server, and run through
   the verification checklist in §6.
