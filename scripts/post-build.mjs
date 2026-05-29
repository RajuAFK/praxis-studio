// Run after `next build` (static export) to slim the `out/` folder
// for upload to Hostinger.
//
// During build, Next copies everything from `public/` into the export
// output. The `public/portfolio` directory is a junction/symlink to the
// studio's 5–6 GB media library — we never want to ship those bytes to
// shared hosting because the deployed site fetches them from Cloudflare R2
// at runtime. Strip the folder here.

import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "out");
const PORTFOLIO = path.join(OUT, "portfolio");

if (!fs.existsSync(OUT)) {
  console.error("post-build: out/ not found; did `next build` succeed?");
  process.exit(1);
}

if (fs.existsSync(PORTFOLIO)) {
  console.log("post-build: removing out/portfolio (served from R2 in prod) …");
  // Use sync rm with force to handle both directories and junction targets.
  fs.rmSync(PORTFOLIO, { recursive: true, force: true });
}

// Drop the index.txt RSC payloads — they're useful for client navigation but
// they balloon the upload, and a static site can do without them.
function dropRscPayloads(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) dropRscPayloads(p);
    else if (entry.isFile() && entry.name === "index.txt") fs.rmSync(p);
  }
}
dropRscPayloads(OUT);

const size = du(OUT);
console.log(`post-build: out/ is now ${(size / 1024 / 1024).toFixed(1)} MB.`);

function du(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    try {
      if (entry.isDirectory()) total += du(p);
      else if (entry.isFile()) total += fs.statSync(p).size;
    } catch {
      // ignore unreadable entries
    }
  }
  return total;
}
