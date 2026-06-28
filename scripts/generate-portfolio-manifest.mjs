// Walks the local /public/portfolio junction once, serializes the Work[]
// array that lib/portfolio.ts would produce, and writes data/portfolio-manifest.json.
//
// Run when the studio's portfolio layout changes:
//   npm run manifest
//
// CI doesn't have access to the junction (it points at the studio's local 5-6
// GB media library on the user's Windows machine). The committed manifest is
// what unblocks builds on GitHub Actions.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR  = path.resolve(__dirname, "..");

// Import the existing builder from lib/portfolio.ts via dynamic TS-aware Node?
// Easiest: re-implement the same walk here in JS, since we control both sides.
const PORTFOLIO = path.join(ROOT_DIR, "public", "portfolio");

if (!fs.existsSync(PORTFOLIO)) {
  console.error("manifest: public/portfolio not found — junction missing.");
  process.exit(1);
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MODEL_EXT = new Set([".glb", ".gltf"]);

function listDirs(...parts) {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
}
function listFiles(...parts) {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && d.name !== "Thumbs.db")
    .map((d) => d.name)
    .sort();
}
function listImagesIn(...parts) {
  return listFiles(...parts).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
}
function findHtmlIn(...parts) {
  const files = listFiles(...parts);
  const folderName = path.basename(path.join(...parts));
  const preferred = files.find(
    (f) =>
      f.toLowerCase() === `${folderName.toLowerCase()}.html` ||
      f.toLowerCase() === `${folderName.toLowerCase().replace(/_/g, "")}.html`
  );
  if (preferred) return preferred;
  return files.find((f) => f.toLowerCase().endsWith(".html")) ?? null;
}
function findModelIn(...parts) {
  return listFiles(...parts).find((f) => MODEL_EXT.has(path.extname(f).toLowerCase())) ?? null;
}
function prettifyName(raw) {
  return raw
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}
function slugify(raw) {
  return raw
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function publicUrl(relParts) {
  const encoded = relParts.map(encodeURIComponent).join("/");
  return `/portfolio/${encoded}`;
}

function buildPhotography() {
  const base = ["Photography"];
  return listDirs(PORTFOLIO, ...base).map((sub) => {
    const dirParts = [...base, sub];
    const imgs = listImagesIn(PORTFOLIO, ...dirParts);
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

function buildVrThumbMap() {
  const thumbsDir = ["Praxis VRs", "Thumbnails for Web Gallereis"];
  const files = listImagesIn(PORTFOLIO, ...thumbsDir);
  const map = {};
  for (const f of files) map[slugify(f)] = publicUrl([...thumbsDir, f]);
  return map;
}

const VR_THUMB_OVERRIDES = {
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
function vrOverrideUrl(workId) {
  const f = VR_THUMB_OVERRIDES[workId];
  return f ? publicUrl(["Praxis VRs", "Thumbnails for Web Gallereis", f]) : null;
}

const GIGAPIXEL_PAINTING_OVERRIDES = {
  "hussain-mother": "Mother.jpg",
  "hussain-indira-gandhi": "Indira_Gandhi.jpg",
  "raja-ravi-varma-painting": "Ravivarma_Painting.jpg",
  "raja-ravi-varma-portrait": "Ravivarma_Portrait.jpg",
  "fishes-by-sudheer": "Sudheer_Thumb.jpg",
};
function gigaPaintingOverrideUrl(workId) {
  const f = GIGAPIXEL_PAINTING_OVERRIDES[workId];
  return f ? publicUrl(["Gigapans", "Paintings", f]) : null;
}

function pickThumb(thumbs, ...candidates) {
  for (const n of candidates) {
    const key = slugify(n);
    if (thumbs[key]) return thumbs[key];
    const partial = Object.keys(thumbs).find((k) => k.includes(key) || key.includes(k));
    if (partial) return thumbs[partial];
  }
  return null;
}

function buildVrs() {
  const base = ["Praxis VRs"];
  const works = [];
  const thumbs = buildVrThumbMap();
  const SKIP = new Set(["Thumbnails for Web Gallereis", "Cars_360 Vr"]);
  for (const sub of listDirs(PORTFOLIO, ...base)) {
    if (SKIP.has(sub)) continue;
    const dirParts = [...base, sub];
    const html = findHtmlIn(PORTFOLIO, ...dirParts);
    if (!html) continue;
    const title = prettifyName(sub.replace(/_/g, " "));
    const id = slugify(sub);
    works.push({
      id, category: "vr", title, kind: "iframe",
      cover: vrOverrideUrl(id) ?? pickThumb(thumbs, title, sub, sub.replace(/_/g, " ")) ?? "",
      imageCount: 0,
      iframeSrc: publicUrl([...dirParts, html]),
    });
  }
  const carsRoot = [...base, "Cars_360 Vr"];
  for (const brand of listDirs(PORTFOLIO, ...carsRoot)) {
    if (brand.toLowerCase().includes("thumb")) continue;
    const brandDir = [...carsRoot, brand];
    const models = listDirs(PORTFOLIO, ...brandDir);
    if (models.length === 0) {
      const html = findHtmlIn(PORTFOLIO, ...brandDir);
      if (!html) continue;
      const niceName = prettifyName(brand);
      const id = `cars-${slugify(brand)}`;
      works.push({
        id, category: "vr", title: niceName, group: "Cars · 360°", kind: "iframe",
        cover: vrOverrideUrl(id) ?? pickThumb(thumbs, brand, niceName) ?? "",
        imageCount: 0,
        iframeSrc: publicUrl([...brandDir, html]),
      });
      continue;
    }
    for (const model of models) {
      const modelDir = [...brandDir, model];
      const html = findHtmlIn(PORTFOLIO, ...modelDir);
      if (!html) continue;
      const niceName = prettifyName(model);
      const id = `cars-${slugify(brand)}-${slugify(model)}`;
      works.push({
        id, category: "vr", title: niceName,
        group: `Cars · ${prettifyName(brand)}`, kind: "iframe",
        cover: vrOverrideUrl(id) ?? pickThumb(thumbs, model, niceName, `${brand} ${model}`) ?? "",
        imageCount: 0,
        iframeSrc: publicUrl([...modelDir, html]),
      });
    }
  }
  return works;
}

function buildGigapans() {
  const base = ["Gigapans"];
  const works = [];
  for (const sub of listDirs(PORTFOLIO, ...base)) {
    const dirParts = [...base, sub];
    const html = findHtmlIn(PORTFOLIO, ...dirParts);
    if (html) {
      const sibling = listImagesIn(PORTFOLIO, ...dirParts)[0];
      works.push({
        id: slugify(sub), category: "gigapixel", title: prettifyName(sub), kind: "iframe",
        cover: sibling ? publicUrl([...dirParts, sibling]) : "",
        imageCount: 0,
        iframeSrc: publicUrl([...dirParts, html]),
      });
      continue;
    }
    for (const child of listDirs(PORTFOLIO, ...dirParts)) {
      const childParts = [...dirParts, child];
      const childHtml = findHtmlIn(PORTFOLIO, ...childParts);
      if (!childHtml) continue;
      const id = slugify(child);
      const siblingJpg = listImagesIn(PORTFOLIO, ...dirParts).find((f) => slugify(f).includes(id));
      const cover = gigaPaintingOverrideUrl(id) ?? (siblingJpg ? publicUrl([...dirParts, siblingJpg]) : "");
      works.push({
        id, category: "gigapixel", title: prettifyName(child),
        group: prettifyName(sub), kind: "iframe",
        cover, imageCount: 0,
        iframeSrc: publicUrl([...childParts, childHtml]),
      });
    }
  }
  return works;
}

function build3D() {
  const base = ["3D Models"];
  return listDirs(PORTFOLIO, ...base)
    .map((sub) => {
      const dirParts = [...base, sub];
      const model = findModelIn(PORTFOLIO, ...dirParts);
      if (!model) return null;
      const imgs = listImagesIn(PORTFOLIO, ...dirParts);
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
    .filter(Boolean);
}

const works = [
  ...buildPhotography(),
  ...buildVrs(),
  ...buildGigapans(),
  ...build3D(),
];

const out = path.join(ROOT_DIR, "data", "portfolio-manifest.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  JSON.stringify({ generatedAt: new Date().toISOString(), works }, null, 2) + "\n"
);
console.log(`manifest: wrote ${works.length} works to ${path.relative(ROOT_DIR, out)}`);
