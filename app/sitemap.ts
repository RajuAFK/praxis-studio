import type { MetadataRoute } from "next";
import { getAllStudies } from "@/lib/case-studies";
import { getAllWorks } from "@/lib/portfolio";

export const dynamic = "force-static";

const BASE = "https://praxivision.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                priority: 1.0, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/studio/`,         priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/case-studies/`,   priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${BASE}/archive/`,        priority: 0.8, changeFrequency: "monthly", lastModified: now },
  ];

  const studyPaths: MetadataRoute.Sitemap = getAllStudies().map((s) => ({
    url: `${BASE}/case-studies/${s.slug}/`,
    priority: 0.7,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  const works = getAllWorks();
  const categories = new Set(works.map((w) => w.category));
  const categoryPaths: MetadataRoute.Sitemap = Array.from(categories).map((c) => ({
    url: `${BASE}/archive/${c}/`,
    priority: 0.6,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  const workPaths: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${BASE}/archive/${w.category}/${w.id}/`,
    priority: 0.5,
    changeFrequency: "yearly",
    lastModified: now,
  }));

  return [...staticPaths, ...studyPaths, ...categoryPaths, ...workPaths];
}
