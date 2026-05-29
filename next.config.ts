import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,

  // Static export — Hostinger shared hosting serves plain HTML/JS files.
  // `next build` writes to `out/`; upload that folder to public_html.
  output: "export",
  trailingSlash: true,

  images: {
    // next/image's on-demand optimizer requires a Node server, which shared
    // hosting doesn't provide. Pass URLs through unchanged.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default config;
