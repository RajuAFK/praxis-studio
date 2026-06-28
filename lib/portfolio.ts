/**
 * Portfolio manifest.
 *
 * Reads the real media tree under /public/portfolio/* (a Windows junction
 * pointing at the studio's Portfolio folder) and produces typed `Work`
 * objects grouped by discipline. Every path it emits is a public URL
 * starting with `/portfolio/...`, which means:
 *
 *   - In dev: served directly from the junction (zero copy).
 *   - In R2:  set NEXT_PUBLIC_MEDIA_BASE to your bucket URL; the same
 *             trailing path resolves there. Build/upload that bucket with
 *             the identical folder structure.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "portfolio");

const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE || "").replace(/\/$/, "");

/** Build a public URL for any path under /public/portfolio. */
function publicUrl(relParts: string[]): string {
  const encoded = relParts.map(encodeURIComponent).join("/");
  return MEDIA_BASE
    ? `${MEDIA_BASE}/portfolio/${encoded}`
    : `/portfolio/${encoded}`;
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MODEL_EXT = new Set([".glb", ".gltf"]);

export type CategoryKey = "photography" | "vr" | "gigapixel" | "3d";

export type WorkKind = "gallery" | "iframe" | "model";

export interface Work {
  id: string;            // url slug
  category: CategoryKey;
  title: string;         // pretty display name
  group?: string;        // optional sub-group label ("Cars · Chevrolet")
  kind: WorkKind;
  cover: string;         // public URL of cover image (always set — image or thumb)
  imageCount: number;    // for galleries; iframe/model = 0 or 1
  // Per-kind payloads ------------------------------------------------------
  gallery?: string[];    // image URLs (gallery)
  iframeSrc?: string;    // HTML viewer URL (iframe)
  modelSrc?: string;     // .glb URL (model)
}

/* ----- name helpers ----------------------------------------------------- */

function prettifyName(raw: string): string {
  return raw
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ----- low-level fs helpers -------------------------------------------- */

function exists(...parts: string[]): boolean {
  return fs.existsSync(path.join(...parts));
}

function listDirs(...parts: string[]): string[] {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}

function listFiles(...parts: string[]): string[] {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && d.name !== "Thumbs.db")
    .map((d) => d.name)
    .sort();
}

function listImagesIn(...parts: string[]): string[] {
  return listFiles(...parts).filter((f) =>
    IMAGE_EXT.has(path.extname(f).toLowerCase())
  );
}

function findHtmlIn(...parts: string[]): string | null {
  const files = listFiles(...parts);
  // Prefer the file matching the folder name (e.g. King_Koti/King_Koti.html)
  const folderName = path.basename(path.join(...parts));
  const preferred = files.find(
    (f) =>
      f.toLowerCase() === `${folderName.toLowerCase()}.html` ||
      f.toLowerCase() === `${folderName.toLowerCase().replace(/_/g, "")}.html`
  );
  if (preferred) return preferred;
  return files.find((f) => f.toLowerCase().endsWith(".html")) ?? null;
}

function findModelIn(...parts: string[]): string | null {
  const files = listFiles(...parts);
  return (
    files.find((f) => MODEL_EXT.has(path.extname(f).toLowerCase())) ?? null
  );
}

/* ----- per-category builders ------------------------------------------ */

function buildPhotography(): Work[] {
  const base = ["Photography"];
  return listDirs(ROOT, ...base).map((sub): Work => {
    const dirParts = [...base, sub];
    const imgs = listImagesIn(ROOT, ...dirParts);
    return {
      id: slugify(sub),
      category: "photography",
      title: prettifyName(sub),
      kind: "gallery",
      cover: imgs.length > 0 ? publicUrl([...dirParts, imgs[0]]) : "",
      imageCount: imgs.length,
      gallery: imgs.map((f) => publicUrl([...dirParts, f])),
    };
  });
}

/**
 * VR thumbnails live in `Praxis VRs/Thumbnails for Web Gallereis/*.jpg`.
 * Match by best-effort name normalisation.
 */
function buildVrThumbMap(): Record<string, string> {
  const thumbsDir = ["Praxis VRs", "Thumbnails for Web Gallereis"];
  const files = listImagesIn(ROOT, ...thumbsDir);
  const map: Record<string, string> = {};
  for (const f of files) {
    const norm = slugify(f);
    map[norm] = publicUrl([...thumbsDir, f]);
  }
  return map;
}

/**
 * Manual overrides for VR works whose folder name doesn't slug-match any
 * thumbnail filename due to historic typos / inconsistent naming
 * (Hundai/Hyundai, Volkswagon/Volkswagen, FXR/XFR, Cayanne/Cayenne, etc.).
 * Key = work id; value = filename (no path) inside `Thumbnails for Web Gallereis/`.
 */
const VR_THUMB_OVERRIDES: Record<string, string> = {
  "king-koti": "Kamineni_Kingkoti.jpg",
  "lsch-tour": "LSCH_Thumb.jpg",
  "cars-chevorlet-chevorlet-beat": "Chevourlet_Beat.jpg",
  "cars-chevorlet-chevorlet-cruise": "Chevourlet_Cruise.jpg",
  "cars-hyundai-hyundai-eon": "Hundai Eon.jpg",
  "cars-hyundai-hyundai-i10": "Hundai i10.jpg",
  "cars-hyundai-hyundai-i20": "Hundai i20.jpg",
  "cars-jaguar-jaguar-fxr": "Jaguar_XFR.jpg",
  "cars-jaguar-jguar-xjl": "Jaguar_XJL.jpg",
  "cars-porsche-porsche-cayenne-s": "Cayanne S.jpg",
  "cars-volkswagon-volkswagon-passat": "Volkswagen Passat.jpg",
  "cars-volkswagon-volkswagon-polo": "Volkswagen_Polo.jpg",
  "cars-volkswagon-volkswagon-vento": "Volkswagen_Vento.jpg",
};

function vrOverrideUrl(workId: string): string | null {
  const f = VR_THUMB_OVERRIDES[workId];
  return f ? publicUrl(["Praxis VRs", "Thumbnails for Web Gallereis", f]) : null;
}

/**
 * Manual overrides for Gigapixel paintings — the sibling JPGs in
 * `Gigapans/Paintings/` use shorthand names that don't slug-match the
 * subfolder.
 */
const GIGAPIXEL_PAINTING_OVERRIDES: Record<string, string> = {
  "hussain-mother": "Mother.jpg",
  "hussain-indira-gandhi": "Indira_Gandhi.jpg",
  "raja-ravi-varma-painting": "Ravivarma_Painting.jpg",
  "raja-ravi-varma-portrait": "Ravivarma_Portrait.jpg",
  "fishes-by-sudheer": "Sudheer_Thumb.jpg",
};

function gigaPaintingOverrideUrl(workId: string): string | null {
  const f = GIGAPIXEL_PAINTING_OVERRIDES[workId];
  return f ? publicUrl(["Gigapans", "Paintings", f]) : null;
}

function pickThumb(
  thumbs: Record<string, string>,
  ...candidateNames: string[]
): string | null {
  for (const n of candidateNames) {
    const key = slugify(n);
    if (thumbs[key]) return thumbs[key];
    // partial match
    const partial = Object.keys(thumbs).find(
      (k) => k.includes(key) || key.includes(k)
    );
    if (partial) return thumbs[partial];
  }
  return null;
}

function buildVrs(): Work[] {
  const base = ["Praxis VRs"];
  const works: Work[] = [];
  const thumbs = buildVrThumbMap();
  const SKIP = new Set([
    "Thumbnails for Web Gallereis",
    "Cars_360 Vr", // expanded into individual works below
  ]);

  for (const sub of listDirs(ROOT, ...base)) {
    if (SKIP.has(sub)) continue;
    const dirParts = [...base, sub];
    const html = findHtmlIn(ROOT, ...dirParts);
    if (!html) continue;
    const title = prettifyName(sub.replace(/_/g, " "));
    const id = slugify(sub);
    works.push({
      id,
      category: "vr",
      title,
      kind: "iframe",
      cover:
        vrOverrideUrl(id) ??
        pickThumb(thumbs, title, sub, sub.replace(/_/g, " ")) ??
        "",
      imageCount: 0,
      iframeSrc: publicUrl([...dirParts, html]),
    });
  }

  // Cars_360 Vr → one work per car model
  const carsRoot = [...base, "Cars_360 Vr"];
  for (const brand of listDirs(ROOT, ...carsRoot)) {
    if (brand.toLowerCase().includes("thumb")) continue;
    const brandDir = [...carsRoot, brand];
    // Each brand contains one or more model folders
    const models = listDirs(ROOT, ...brandDir);
    if (models.length === 0) {
      // brand folder is itself a tour
      const html = findHtmlIn(ROOT, ...brandDir);
      if (!html) continue;
      const niceName = prettifyName(brand);
      const id = `cars-${slugify(brand)}`;
      works.push({
        id,
        category: "vr",
        title: niceName,
        group: "Cars · 360°",
        kind: "iframe",
        cover: vrOverrideUrl(id) ?? pickThumb(thumbs, brand, niceName) ?? "",
        imageCount: 0,
        iframeSrc: publicUrl([...brandDir, html]),
      });
      continue;
    }
    for (const model of models) {
      const modelDir = [...brandDir, model];
      const html = findHtmlIn(ROOT, ...modelDir);
      if (!html) continue;
      const niceName = prettifyName(model);
      const id = `cars-${slugify(brand)}-${slugify(model)}`;
      works.push({
        id,
        category: "vr",
        title: niceName,
        group: `Cars · ${prettifyName(brand)}`,
        kind: "iframe",
        cover:
          vrOverrideUrl(id) ??
          pickThumb(thumbs, model, niceName, `${brand} ${model}`) ??
          "",
        imageCount: 0,
        iframeSrc: publicUrl([...modelDir, html]),
      });
    }
  }

  return works;
}

function buildGigapans(): Work[] {
  const base = ["Gigapans"];
  const works: Work[] = [];
  for (const sub of listDirs(ROOT, ...base)) {
    const dirParts = [...base, sub];
    // Single-tour case: folder contains an HTML viewer
    const html = findHtmlIn(ROOT, ...dirParts);
    if (html) {
      // Look for a flat cover image sitting next to the viewer (e.g.
      // Golconda_Gigapan.png drops in beside Golconda_Gigapan.html).
      const sibling = listImagesIn(ROOT, ...dirParts)[0];
      works.push({
        id: slugify(sub),
        category: "gigapixel",
        title: prettifyName(sub),
        kind: "iframe",
        cover: sibling ? publicUrl([...dirParts, sibling]) : "",
        imageCount: 0,
        iframeSrc: publicUrl([...dirParts, html]),
      });
      continue;
    }
    // Paintings-style folder: each subfolder is its own gigapixel work
    for (const child of listDirs(ROOT, ...dirParts)) {
      const childParts = [...dirParts, child];
      const childHtml = findHtmlIn(ROOT, ...childParts);
      if (!childHtml) continue;
      const id = slugify(child);
      // 1) Manual override map
      // 2) Sibling jpg by slug match
      const siblingJpg = listImagesIn(ROOT, ...dirParts).find((f) =>
        slugify(f).includes(id)
      );
      const cover =
        gigaPaintingOverrideUrl(id) ??
        (siblingJpg ? publicUrl([...dirParts, siblingJpg]) : "");
      works.push({
        id,
        category: "gigapixel",
        title: prettifyName(child),
        group: prettifyName(sub),
        kind: "iframe",
        cover,
        imageCount: 0,
        iframeSrc: publicUrl([...childParts, childHtml]),
      });
    }
  }
  return works;
}

function build3D(): Work[] {
  const base = ["3D Models"];
  return listDirs(ROOT, ...base)
    .map((sub): Work | null => {
      const dirParts = [...base, sub];
      const model = findModelIn(ROOT, ...dirParts);
      if (!model) return null;
      const imgs = listImagesIn(ROOT, ...dirParts);
      return {
        id: slugify(sub),
        category: "3d",
        title: prettifyName(sub),
        kind: "model",
        cover: imgs.length > 0 ? publicUrl([...dirParts, imgs[0]]) : "",
        imageCount: 0,
        modelSrc: publicUrl([...dirParts, model]),
      };
    })
    .filter((w): w is Work => w !== null);
}

/* ----- public API ------------------------------------------------------ */

let cache: Work[] | null = null;

export function getAllWorks(): Work[] {
  if (cache) return cache;
  if (fs.existsSync(ROOT)) {
    cache = [
      ...buildPhotography(),
      ...buildVrs(),
      ...buildGigapans(),
      ...build3D(),
    ];
    return cache;
  }
  // Fallback: committed manifest. Used by CI builds where the studio's
  // local /public/portfolio junction does not exist. Regenerate the manifest
  // locally with `npm run manifest` whenever the studio's media tree changes.
  try {
    const manifestPath = path.join(process.cwd(), "data", "portfolio-manifest.json");
    if (fs.existsSync(manifestPath)) {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      cache = Array.isArray(parsed.works) ? (parsed.works as Work[]) : [];
      return cache;
    }
  } catch {
    // fall through
  }
  cache = [];
  return cache;
}

export function getWorksByCategory(cat: CategoryKey): Work[] {
  return getAllWorks().filter((w) => w.category === cat);
}

export function getWork(cat: CategoryKey, id: string): Work | undefined {
  return getAllWorks().find((w) => w.category === cat && w.id === id);
}

export function getCategoryCounts(): Record<CategoryKey, number> {
  const out: Record<CategoryKey, number> = {
    photography: 0,
    vr: 0,
    gigapixel: 0,
    "3d": 0,
  };
  for (const w of getAllWorks()) out[w.category]++;
  return out;
}

/** Total image count across all photography galleries — for hero counters etc. */
export function getTotalImageCount(): number {
  return getAllWorks().reduce((sum, w) => sum + w.imageCount, 0);
}
