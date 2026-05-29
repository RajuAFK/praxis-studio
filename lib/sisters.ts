export interface Sister {
  key: "studio" | "tiv" | "p3d";
  name: string;
  tail: string;        // last word(s) italicized in ember
  year: string;        // "1992"
  tag: string;
  tagline: string;
  body: string;
  plateId: string;
  position?: string;
  url: string | null;  // external URL or null for current
  urlLabel: string;
}

export const SISTERS: Sister[] = [
  {
    key: "studio",
    name: "Praxis Studio",
    tail: "Studio",
    year: "1992", tag: "PHOTOGRAPHY",
    tagline: "The studio for industrial light.",
    body: "Industrial photography, annual reports, brand campaigns, plant documentation. The original — and still the spine — of Praxivision.",
    plateId: "glass-01",
    position: "50% 55%",
    url: null, urlLabel: "praxis-studio.in",
  },
  {
    key: "tiv",
    name: "Tour It Virtually",
    tail: "Virtually",
    year: "2017", tag: "HERITAGE",
    tagline: "Heritage, immersively documented.",
    body: "360° walkthroughs, photogrammetric scans, and interactive guides for museums, archaeological sites, tourism boards, and private collections.",
    plateId: "tunnel-01",
    position: "60% 50%",
    url: "https://touritvirtually.com",
    urlLabel: "touritvirtually.com",
  },
  {
    key: "p3d",
    name: "Praxis 3D Informatics",
    tail: "Informatics",
    year: "2024", tag: "VOLUMETRICS",
    tagline: "Surfaces, volumes, splats.",
    body: "Close-range photogrammetry and gaussian splat capture for digital twins, conservation files, infrastructure documentation, and 3D archival.",
    plateId: "tooling-01",
    url: null, urlLabel: "praxis3d.in",
  },
];
