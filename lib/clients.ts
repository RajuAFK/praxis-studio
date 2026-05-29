import fs from "node:fs";
import path from "node:path";

/**
 * Read client logos from /public/clients/{industry-slug}/* at build time.
 * Drop a file in any of the industry folders and it shows up — no manifest
 * to maintain.
 */

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

export interface Industry {
  /** URL slug — matches the folder name under public/clients/ */
  slug: string;
  /** Display label */
  label: string;
  /** Client logos in this industry */
  clients: ClientLogo[];
}

export interface ClientLogo {
  /** Pretty display name derived from the filename */
  name: string;
  /** Public URL (starts with /clients/...) */
  src: string;
  /** Industry slug this logo lives under */
  industry: string;
}

/** Display label overrides for slugs that don't round-trip cleanly. */
const LABEL_OVERRIDES: Record<string, string> = {
  "seeds-fertilisers": "Seeds & Fertilisers",
};

/** "consumer-durables" → "Consumer Durables" */
function slugToLabel(slug: string): string {
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

/** "AGI_Glaspac_Logo.png" → "AGI Glaspac" */
function fileToName(file: string): string {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b(logo|wht|wht2|logo1|logo2|_logo|edit(ed)?|new|final|copy)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

let cache: Industry[] | null = null;

export function getIndustries(): Industry[] {
  if (cache) return cache;

  const root = path.join(process.cwd(), "public", "clients");
  if (!fs.existsSync(root)) {
    cache = [];
    return cache;
  }

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  cache = dirs.map((slug) => {
    const folder = path.join(root, slug);
    const files = fs
      .readdirSync(folder)
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .sort();
    return {
      slug,
      label: slugToLabel(slug),
      clients: files.map((file) => ({
        name: fileToName(file),
        src: `/clients/${slug}/${file}`,
        industry: slug,
      })),
    };
  });

  return cache;
}

/** Flat list of every client logo (used by the "ALL" filter). */
export function getAllClients(): ClientLogo[] {
  return getIndustries().flatMap((i) => i.clients);
}

/** Total client count across all industries. */
export function getClientCount(): number {
  return getIndustries().reduce((sum, i) => sum + i.clients.length, 0);
}
