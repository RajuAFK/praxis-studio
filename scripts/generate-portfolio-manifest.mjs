// Walks either the local public/portfolio junction OR the praxivision R2
// bucket and produces data/portfolio-manifest.json — the source of truth
// lib/portfolio.ts reads when the junction is missing (CI builds).
//
// Modes:
//   npm run manifest            (default: junction walk — for local dev)
//   npm run manifest -- --r2    (R2 listing — for CI; requires R2_* env vars)
//
// Output shape: { generatedAt: ISO, source: 'junction'|'r2', works: Work[] }

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR  = path.resolve(__dirname, "..");

const args   = process.argv.slice(2);
const useR2  = args.includes("--r2");
const PORTFOLIO = path.join(ROOT_DIR, "public", "portfolio");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MODEL_EXT = new Set([".glb", ".gltf"]);

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
function publicUrlJunction(relParts) {
  const encoded = relParts.map(encodeURIComponent).join("/");
  return `/portfolio/${encoded}`;
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

const GIGAPIXEL_PAINTING_OVERRIDES = {
  "hussain-mother": "Mother.jpg",
  "hussain-indira-gandhi": "Indira_Gandhi.jpg",
  "raja-ravi-varma-painting": "Ravivarma_Painting.jpg",
  "raja-ravi-varma-portrait": "Ravivarma_Portrait.jpg",
  "fishes-by-sudheer": "Sudheer_Thumb.jpg",
};

/* ============================================================
 * MODE A: walk the local junction
 * ============================================================ */

function listDirs(...parts) {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name).sort();
}
function listFiles(...parts) {
  const p = path.join(...parts);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith(".") && d.name !== "Thumbs.db")
    .map((d) => d.name).sort();
}
function listImagesInJ(...parts) {
  return listFiles(...parts).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
}
function findHtmlInJ(...parts) {
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
function findModelInJ(...parts) {
  return listFiles(...parts).find((f) => MODEL_EXT.has(path.extname(f).toLowerCase())) ?? null;
}

function buildJunction() {
  if (!fs.existsSync(PORTFOLIO)) {
    console.error("manifest: public/portfolio not found — junction missing.");
    process.exit(1);
  }

  const photography = listDirs(PORTFOLIO, "Photography").map((sub) => {
    const dirParts = ["Photography", sub];
    const imgs = listImagesInJ(PORTFOLIO, ...dirParts);
    return {
      id: slugify(sub), category: "photography",
      title: prettifyName(sub), kind: "gallery",
      cover: imgs.length > 0 ? publicUrlJunction([...dirParts, imgs[0]]) : "",
      imageCount: imgs.length,
      gallery: imgs.map((f) => publicUrlJunction([...dirParts, f])),
    };
  });

  const buildVrThumbMap = () => {
    const thumbsDir = ["Praxis VRs", "Thumbnails for Web Gallereis"];
    const files = listImagesInJ(PORTFOLIO, ...thumbsDir);
    const map = {};
    for (const f of files) map[slugify(f)] = publicUrlJunction([...thumbsDir, f]);
    return map;
  };
  const vrThumbs = buildVrThumbMap();
  const vrOverride = (id) => {
    const f = VR_THUMB_OVERRIDES[id];
    return f ? publicUrlJunction(["Praxis VRs", "Thumbnails for Web Gallereis", f]) : null;
  };
  const pickThumb = (thumbs, ...candidates) => {
    for (const n of candidates) {
      const key = slugify(n);
      if (thumbs[key]) return thumbs[key];
      const partial = Object.keys(thumbs).find((k) => k.includes(key) || key.includes(k));
      if (partial) return thumbs[partial];
    }
    return null;
  };

  const vrs = [];
  const SKIP = new Set(["Thumbnails for Web Gallereis", "Cars_360 Vr"]);
  for (const sub of listDirs(PORTFOLIO, "Praxis VRs")) {
    if (SKIP.has(sub)) continue;
    const dirParts = ["Praxis VRs", sub];
    const html = findHtmlInJ(PORTFOLIO, ...dirParts);
    if (!html) continue;
    const title = prettifyName(sub.replace(/_/g, " "));
    const id = slugify(sub);
    vrs.push({
      id, category: "vr", title, kind: "iframe",
      cover: vrOverride(id) ?? pickThumb(vrThumbs, title, sub, sub.replace(/_/g, " ")) ?? "",
      imageCount: 0,
      iframeSrc: publicUrlJunction([...dirParts, html]),
    });
  }
  for (const brand of listDirs(PORTFOLIO, "Praxis VRs", "Cars_360 Vr")) {
    if (brand.toLowerCase().includes("thumb")) continue;
    const brandDir = ["Praxis VRs", "Cars_360 Vr", brand];
    const models = listDirs(PORTFOLIO, ...brandDir);
    if (models.length === 0) {
      const html = findHtmlInJ(PORTFOLIO, ...brandDir);
      if (!html) continue;
      const niceName = prettifyName(brand);
      const id = `cars-${slugify(brand)}`;
      vrs.push({
        id, category: "vr", title: niceName, group: "Cars · 360°", kind: "iframe",
        cover: vrOverride(id) ?? pickThumb(vrThumbs, brand, niceName) ?? "",
        imageCount: 0,
        iframeSrc: publicUrlJunction([...brandDir, html]),
      });
      continue;
    }
    for (const model of models) {
      const modelDir = [...brandDir, model];
      const html = findHtmlInJ(PORTFOLIO, ...modelDir);
      if (!html) continue;
      const niceName = prettifyName(model);
      const id = `cars-${slugify(brand)}-${slugify(model)}`;
      vrs.push({
        id, category: "vr", title: niceName,
        group: `Cars · ${prettifyName(brand)}`, kind: "iframe",
        cover: vrOverride(id) ?? pickThumb(vrThumbs, model, niceName, `${brand} ${model}`) ?? "",
        imageCount: 0,
        iframeSrc: publicUrlJunction([...modelDir, html]),
      });
    }
  }

  const gigapans = [];
  for (const sub of listDirs(PORTFOLIO, "Gigapans")) {
    const dirParts = ["Gigapans", sub];
    const html = findHtmlInJ(PORTFOLIO, ...dirParts);
    if (html) {
      const sibling = listImagesInJ(PORTFOLIO, ...dirParts)[0];
      gigapans.push({
        id: slugify(sub), category: "gigapixel", title: prettifyName(sub), kind: "iframe",
        cover: sibling ? publicUrlJunction([...dirParts, sibling]) : "",
        imageCount: 0,
        iframeSrc: publicUrlJunction([...dirParts, html]),
      });
      continue;
    }
    for (const child of listDirs(PORTFOLIO, ...dirParts)) {
      const childParts = [...dirParts, child];
      const childHtml = findHtmlInJ(PORTFOLIO, ...childParts);
      if (!childHtml) continue;
      const id = slugify(child);
      const siblingJpg = listImagesInJ(PORTFOLIO, ...dirParts).find((f) => slugify(f).includes(id));
      const cover = (GIGAPIXEL_PAINTING_OVERRIDES[id]
        ? publicUrlJunction(["Gigapans", sub, GIGAPIXEL_PAINTING_OVERRIDES[id]])
        : (siblingJpg ? publicUrlJunction([...dirParts, siblingJpg]) : ""));
      gigapans.push({
        id, category: "gigapixel", title: prettifyName(child),
        group: prettifyName(sub), kind: "iframe",
        cover, imageCount: 0,
        iframeSrc: publicUrlJunction([...childParts, childHtml]),
      });
    }
  }

  const threeD = listDirs(PORTFOLIO, "3D Models").map((sub) => {
    const dirParts = ["3D Models", sub];
    const model = findModelInJ(PORTFOLIO, ...dirParts);
    if (!model) return null;
    const imgs = listImagesInJ(PORTFOLIO, ...dirParts);
    return {
      id: slugify(sub), category: "3d",
      title: prettifyName(sub), kind: "model",
      cover: imgs.length > 0 ? publicUrlJunction([...dirParts, imgs[0]]) : "",
      imageCount: 0,
      modelSrc: publicUrlJunction([...dirParts, model]),
    };
  }).filter(Boolean);

  return [...photography, ...vrs, ...gigapans, ...threeD];
}

/* ============================================================
 * MODE B: list R2 via S3-compatible ListObjectsV2 (SigV4 query auth)
 * ============================================================ */

function r2Env() {
  const e = {
    accountId:  process.env.R2_ACCOUNT_ID  || "",
    bucket:     process.env.R2_BUCKET      || "",
    accessKey:  process.env.R2_LIST_KEY    || process.env.R2_ACCESS_KEY || "",
    secretKey:  process.env.R2_LIST_SECRET || process.env.R2_SECRET_KEY || "",
    publicBase: (process.env.NEXT_PUBLIC_R2_BASE
              || process.env.R2_PUBLIC_BASE
              || "").replace(/\/$/, ""),
  };
  for (const k of ["accountId", "bucket", "accessKey", "secretKey", "publicBase"]) {
    if (!e[k]) { console.error(`R2 manifest: missing env value for ${k}`); process.exit(1); }
  }
  return e;
}
function rfc3986(s) {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
function encodeKeyPath(p) { return p.split("/").map(rfc3986).join("/"); }
function canonicalQuery(params) {
  return Object.keys(params).sort().map((k) => rfc3986(k) + "=" + rfc3986(params[k])).join("&");
}
function hmacBuf(key, data) { return crypto.createHmac("sha256", key).update(data).digest(); }
function sha256hex(s) { return crypto.createHash("sha256").update(s).digest("hex"); }
function signingKey(short_date, secret) {
  let k = hmacBuf("AWS4" + secret, short_date);
  k = hmacBuf(k, "auto"); k = hmacBuf(k, "s3");
  return hmacBuf(k, "aws4_request");
}

async function r2ListPage(env, params) {
  const host = `${env.accountId}.r2.cloudflarestorage.com`;
  const uri  = "/" + rfc3986(env.bucket);
  const now        = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const short_date = now.slice(0, 8);
  const scope      = `${short_date}/auto/s3/aws4_request`;
  const q = {
    ...params,
    "X-Amz-Algorithm":     "AWS4-HMAC-SHA256",
    "X-Amz-Credential":    `${env.accessKey}/${scope}`,
    "X-Amz-Date":          now,
    "X-Amz-Expires":       "60",
    "X-Amz-SignedHeaders": "host",
  };
  const cq    = canonicalQuery(q);
  const creq  = ["GET", uri, cq, `host:${host}`, "", "host", "UNSIGNED-PAYLOAD"].join("\n");
  const sts   = ["AWS4-HMAC-SHA256", now, scope, sha256hex(creq)].join("\n");
  const sig   = crypto.createHmac("sha256", signingKey(short_date, env.secretKey)).update(sts).digest("hex");
  const url   = `https://${host}${uri}?${cq}&X-Amz-Signature=${sig}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`R2 list HTTP ${res.status}: ${body.slice(0, 400)}`);
  }
  return res.text();
}

function parseListXml(xml) {
  const objects = [];
  const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                          .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
  const re = /<Contents>([\s\S]*?)<\/Contents>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const keyM = /<Key>([\s\S]*?)<\/Key>/.exec(block);
    if (keyM) objects.push(decode(keyM[1]));
  }
  const truncM = /<IsTruncated>(true|false)<\/IsTruncated>/.exec(xml);
  const tokM   = /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml);
  return {
    keys: objects,
    isTruncated: truncM ? truncM[1] === "true" : false,
    nextToken:   tokM ? decode(tokM[1]) : null,
  };
}

async function r2ListAll(env, prefix) {
  const all = [];
  let token = null;
  for (let i = 0; i < 50; i++) {
    const params = { "list-type": "2", "max-keys": "1000", prefix };
    if (token) params["continuation-token"] = token;
    const xml = await r2ListPage(env, params);
    const { keys, isTruncated, nextToken } = parseListXml(xml);
    all.push(...keys);
    if (!isTruncated || !nextToken) break;
    token = nextToken;
  }
  return all;
}

function publicUrlR2(env, key) { return env.publicBase + "/" + encodeKeyPath(key); }
function ext(s) { const i = s.lastIndexOf("."); return i >= 0 ? s.slice(i).toLowerCase() : ""; }
function basename(s) { const i = s.lastIndexOf("/"); return i >= 0 ? s.slice(i + 1) : s; }

function pickEntryHtml(htmls, folderName) {
  if (htmls.length === 0) return null;
  const lname = folderName.toLowerCase();
  const stripped = lname.replace(/_/g, "");
  const preferred = htmls.find((k) => {
    const b = basename(k).toLowerCase();
    return b === lname + ".html" || b === stripped + ".html";
  });
  if (preferred) return preferred;
  const idx = htmls.find((k) => basename(k).toLowerCase() === "index.html");
  return idx || htmls[0];
}

async function buildR2() {
  const env = r2Env();
  const keys = await r2ListAll(env, "portfolio/");

  // Group keys by their parent folder (full key minus the basename)
  const groups = new Map();
  for (const key of keys) {
    const parts = key.split("/");
    if (parts.length < 3) continue;
    const folder = parts.slice(0, -1).join("/");
    let g = groups.get(folder);
    if (!g) {
      g = {
        path: folder,
        parts: parts.slice(1, -1), // drop "portfolio" prefix
        images: [], htmls: [], models: [],
      };
      groups.set(folder, g);
    }
    const e = ext(key);
    if (IMAGE_EXT.has(e))      g.images.push(key);
    else if (e === ".html")    g.htmls.push(key);
    else if (MODEL_EXT.has(e)) g.models.push(key);
  }

  // Build VR thumbnail lookup for cover matching
  const vrThumbs = {};
  const vrThumbFolder = groups.get("portfolio/Praxis VRs/Thumbnails for Web Gallereis");
  if (vrThumbFolder) {
    for (const img of vrThumbFolder.images) {
      vrThumbs[slugify(basename(img))] = publicUrlR2(env, img);
    }
  }
  const vrOverride = (id) => {
    const f = VR_THUMB_OVERRIDES[id];
    return f ? publicUrlR2(env, `portfolio/Praxis VRs/Thumbnails for Web Gallereis/${f}`) : null;
  };
  const pickThumbR2 = (...candidates) => {
    for (const n of candidates) {
      const key = slugify(n);
      if (vrThumbs[key]) return vrThumbs[key];
      const partial = Object.keys(vrThumbs).find((k) => k.includes(key) || key.includes(k));
      if (partial) return vrThumbs[partial];
    }
    return null;
  };

  const folderList = Array.from(groups.values()).sort((a, b) => a.path.localeCompare(b.path));
  const works = [];
  for (const g of folderList) {
    const top = g.parts[0];
    if (!top) continue;

    if (top === "Photography" && g.parts.length === 2 && g.images.length > 0) {
      const sub = g.parts[1];
      const gallery = g.images.slice().sort().map((k) => publicUrlR2(env, k));
      works.push({
        id: slugify(sub), category: "photography",
        title: prettifyName(sub), kind: "gallery",
        cover: gallery[0] || "", imageCount: gallery.length, gallery,
      });
      continue;
    }

    if (top === "Praxis VRs" && g.parts.length >= 2 && g.htmls.length > 0) {
      if (g.parts[1] === "Thumbnails for Web Gallereis") continue;
      if (g.parts.length === 2 && g.parts[1] !== "Cars_360 Vr") {
        const sub = g.parts[1];
        const entry = pickEntryHtml(g.htmls, sub);
        if (!entry) continue;
        const id = slugify(sub);
        const title = prettifyName(sub.replace(/_/g, " "));
        works.push({
          id, category: "vr", title, kind: "iframe",
          cover: vrOverride(id) ?? pickThumbR2(title, sub, sub.replace(/_/g, " ")) ?? "",
          imageCount: 0, iframeSrc: publicUrlR2(env, entry),
        });
        continue;
      }
      if (g.parts[1] === "Cars_360 Vr") {
        if (g.parts.length === 3) {
          const brand = g.parts[2];
          if (brand.toLowerCase().includes("thumb")) continue;
          const entry = pickEntryHtml(g.htmls, brand);
          if (!entry) continue;
          const id = `cars-${slugify(brand)}`;
          works.push({
            id, category: "vr",
            title: prettifyName(brand), group: "Cars · 360°", kind: "iframe",
            cover: vrOverride(id) ?? pickThumbR2(brand, prettifyName(brand)) ?? "",
            imageCount: 0, iframeSrc: publicUrlR2(env, entry),
          });
          continue;
        }
        if (g.parts.length === 4) {
          const brand = g.parts[2]; const model = g.parts[3];
          const entry = pickEntryHtml(g.htmls, model);
          if (!entry) continue;
          const id = `cars-${slugify(brand)}-${slugify(model)}`;
          works.push({
            id, category: "vr",
            title: prettifyName(model),
            group: `Cars · ${prettifyName(brand)}`, kind: "iframe",
            cover: vrOverride(id) ?? pickThumbR2(model, prettifyName(model), `${brand} ${model}`) ?? "",
            imageCount: 0, iframeSrc: publicUrlR2(env, entry),
          });
          continue;
        }
      }
      continue;
    }

    if (top === "Gigapans" && g.htmls.length > 0) {
      if (g.parts.length === 2) {
        const sub = g.parts[1];
        const entry = pickEntryHtml(g.htmls, sub);
        if (!entry) continue;
        const sibling = g.images.slice().sort()[0];
        works.push({
          id: slugify(sub), category: "gigapixel",
          title: prettifyName(sub), kind: "iframe",
          cover: sibling ? publicUrlR2(env, sibling) : "",
          imageCount: 0, iframeSrc: publicUrlR2(env, entry),
        });
        continue;
      }
      if (g.parts.length === 3) {
        const parent = g.parts[1]; const child = g.parts[2];
        const entry = pickEntryHtml(g.htmls, child);
        if (!entry) continue;
        const id = slugify(child);
        const parentGroup = groups.get(`portfolio/Gigapans/${parent}`);
        let cover = "";
        if (parentGroup) {
          const sib = parentGroup.images.find((k) => slugify(basename(k)).includes(id));
          if (sib) cover = publicUrlR2(env, sib);
        }
        if (!cover && GIGAPIXEL_PAINTING_OVERRIDES[id]) {
          cover = publicUrlR2(env, `portfolio/Gigapans/${parent}/${GIGAPIXEL_PAINTING_OVERRIDES[id]}`);
        }
        works.push({
          id, category: "gigapixel",
          title: prettifyName(child), group: prettifyName(parent), kind: "iframe",
          cover, imageCount: 0, iframeSrc: publicUrlR2(env, entry),
        });
        continue;
      }
    }

    if (top === "3D Models" && g.parts.length === 2 && g.models.length > 0) {
      const sub = g.parts[1];
      const model = g.models.slice().sort()[0];
      const cover = g.images.slice().sort()[0];
      works.push({
        id: slugify(sub), category: "3d",
        title: prettifyName(sub), kind: "model",
        cover: cover ? publicUrlR2(env, cover) : "",
        imageCount: 0, modelSrc: publicUrlR2(env, model),
      });
      continue;
    }
  }
  return works;
}

/* ============================================================
 * main
 * ============================================================ */
const works = useR2 ? await buildR2() : buildJunction();
const out = path.join(ROOT_DIR, "data", "portfolio-manifest.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: useR2 ? "r2" : "junction",
  works,
}, null, 2) + "\n");
console.log(`manifest: wrote ${works.length} works to ${path.relative(ROOT_DIR, out)} (source: ${useR2 ? "r2" : "junction"})`);
