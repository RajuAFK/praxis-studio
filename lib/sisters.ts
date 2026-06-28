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
  urlLabel: string | null;
  logo: string;        // /logos/*.png
}

export const SISTERS: Sister[] = [
  {
    key: "studio",
    name: "Praxis Studio",
    tail: "Studio",
    year: "1992", tag: "PHOTOGRAPHY",
    tagline: "The studio for institutions.",
    body: "Photography, gigapixel imagery, and the archival spine of the practice. The original department of Praxivision.",
    plateId: "glass-01",
    position: "50% 55%",
    url: null, urlLabel: null,
    logo: "/logos/praxis-studio.png",
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
    logo: "/logos/tiv.png",
  },
  {
    key: "p3d",
    name: "Praxis 3D Informatics",
    tail: "Informatics",
    year: "2024", tag: "VOLUMETRICS",
    tagline: "Surfaces, volumes, splats.",
    body: "Close-range photogrammetry and gaussian splat capture for digital twins, conservation files, infrastructure documentation, and 3D archival.",
    plateId: "tooling-01",
    url: null, urlLabel: null,
    logo: "/logos/praxis-3d.png",
  },
];
