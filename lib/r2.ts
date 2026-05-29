/**
 * Cloudflare R2 URL helpers.
 *
 * All media (image stills + interactive viewer apps) live in R2 under the
 * NEXT_PUBLIC_R2_BASE bucket. Stills are referenced as direct images; the
 * 4 live viewers (gigapixel / 360 / orbit / splat) are full HTML apps and
 * are embedded as <iframe src=…>.
 *
 * Layout convention:
 *   {base}/plates/{plateId}.jpg          → still image
 *   {base}/plates/{plateId}.thumb.jpg    → low-res thumb (optional)
 *   {base}/viewers/{viewerId}/           → folder with index.html
 *
 * Override any URL by passing an absolute https:// URL anywhere a plateId
 * or viewerId is expected.
 */

const BASE = (process.env.NEXT_PUBLIC_R2_BASE || "").replace(/\/$/, "");

/**
 * Plate IDs that have a local file under /public/plates/{id}.jpg.
 * When R2 isn't configured these resolve to the local file so dev sees
 * real photos; everything else falls back to the placeholder block.
 */
const LOCAL_PLATES = new Set<string>([
  "glass-01",
  "tunnel-01",
  "cataract-01",
  "marwar-01",
  "tooling-01",
  "studio-hero",
]);

export function r2Base(): string {
  return BASE;
}

function isAbsolute(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

/** Resolve a plate (still image) id to a full URL. */
export function plateUrl(id: string, variant: "full" | "thumb" = "full"): string {
  if (isAbsolute(id)) return id;
  const file = variant === "thumb" ? `${id}.thumb.jpg` : `${id}.jpg`;
  if (BASE) return `${BASE}/plates/${file}`;
  if (LOCAL_PLATES.has(id)) return `/plates/${file}`;
  return "";
}

/** True when this id has a usable image source (R2 base or local file). */
export function hasPlateImage(id: string): boolean {
  if (isAbsolute(id)) return true;
  if (BASE) return true;
  return LOCAL_PLATES.has(id);
}

/** Resolve a viewer id (gigapixel/360/orbit/splat app folder) to an iframe URL. */
export function viewerUrl(id: string): string {
  if (isAbsolute(id)) return id;
  return BASE ? `${BASE}/viewers/${id}/` : `/placeholder/viewers/${id}/`;
}

/** True when no R2 base is configured — UI falls back to a local placeholder block. */
export function isPlaceholder(): boolean {
  return !BASE;
}
