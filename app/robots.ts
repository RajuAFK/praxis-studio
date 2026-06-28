import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/case-studies-media/"],
      },
    ],
    sitemap: "https://praxivision.com/sitemap.xml",
    host: "https://praxivision.com",
  };
}
