/**
 * Plate + featured plate catalogue.
 *
 * `plateId` resolves through lib/r2.ts to an R2 URL — or to a local file in
 * /public/plates/{id}.jpg while NEXT_PUBLIC_R2_BASE is unset.
 */

export type Discipline =
  | "INDUSTRIAL"
  | "GIGAPIXEL"
  | "360°"
  | "PHOTOGRAMMETRY"
  | "SPLATS";

export type ViewerKind = "gigapixel" | "tour360" | "orbit" | "splat";

export interface Plate {
  id: string;            // plate id used to resolve R2 image
  no: string;            // display number ("389")
  year: string;          // "2024"
  title: string;         // "Glass Pour, Firozabad" — last word will be italic-ember
  client: string;
  discipline: Discipline;
  disciplineLabel?: string;
  position?: string;     // CSS object-position for the still
}

export type HeroTextPosition = "left-bottom" | "right-bottom" | "top-left";

export interface Featured extends Plate {
  tag: "FOUNDATION" | "SURFACE" | "PLACE" | "OBJECT" | "LIGHT";
  headHead: string;      // "Glass,"
  headTail: string;      // "poured."
  intro: string;
  /** Where to place the headline over the hero photo. */
  textPosition?: HeroTextPosition;
}

export const FEATURED: Featured[] = [
  {
    id: "glass-01",
    no: "389", year: "2024", client: "Triveni Glass",
    discipline: "INDUSTRIAL", disciplineLabel: "INDUSTRIAL",
    title: "Glass Pour, Firozabad",
    tag: "FOUNDATION",
    headHead: "Glass,", headTail: "poured.",
    intro:
      "Three nights inside the cylinder press at one of the oldest glassworks in Firozabad. Two cameras, a 1400°C gob, and no flash — the glass does the lighting. The brief asked for one frame. We delivered thirty-four.",
    position: "50% 55%",
    textPosition: "right-bottom",
  },
  {
    id: "cataract-01",
    no: "434", year: "2025", client: "L V Prasad Eye Institute",
    discipline: "GIGAPIXEL", disciplineLabel: "MACRO · GIGAPIXEL",
    title: "Cataract, Theatre 2",
    tag: "SURFACE",
    headHead: "Precision,", headTail: "recorded.",
    intro:
      "Sterile-field macro captured through a custom housing on a long stop. The brief was a single image for an annual report. We delivered eleven — one of which now hangs, three metres wide, in the Institute lobby.",
    position: "40% 60%",
    textPosition: "right-bottom",
  },
  {
    id: "tunnel-01",
    no: "412", year: "2026", client: "Konkan Railway Corporation",
    discipline: "360°", disciplineLabel: "360° TRAVERSE · 9 STATIONS",
    title: "Tunnel No. 7, Konkan",
    tag: "PLACE",
    headHead: "Lines,", headTail: "kept.",
    intro:
      "A nine-station immersive of one of India's longest active railway tunnels, captured between scheduled traffic over five pre-dawn sessions. Hotspot navigation, distance markers, embedded media — delivered to the browser.",
    position: "60% 50%",
    textPosition: "left-bottom",
  },
  {
    id: "tooling-01",
    no: "362", year: "2024", client: "Husky Injection Molding",
    discipline: "PHOTOGRAMMETRY", disciplineLabel: "PHOTOGRAMMETRY · 1.8M VERTS",
    title: "Injection Tooling, Chakan",
    tag: "OBJECT",
    headHead: "Tooling,", headTail: "documented.",
    intro:
      "A sub-millimetre mesh of a sixty-cavity preform mould, captured for the engineering archive. One-point-eight million vertices. Dimension-true, scaled, and ready for the digital twin or the maintenance kiosk.",
    position: "50% 50%",
    textPosition: "top-left",
  },
  {
    id: "marwar-01",
    no: "401", year: "2025", client: "Gati Limited",
    discipline: "INDUSTRIAL", disciplineLabel: "DOCUMENTARY · BRAND ESSAY",
    title: "Last Mile, Marwar",
    tag: "LIGHT",
    headHead: "Routes,", headTail: "delivered.",
    intro:
      "Three weeks shadowing a single delivery convoy across the Marwar belt for the Gati annual — the kind of campaign that asks the photographer to live with the subject. Tethered medium format under cotton dust covers; daylight, always.",
    position: "50% 60%",
    textPosition: "top-left",
  },
];

/** Archive index — shown on /archive, descending by year then plate number. */
export const ARCHIVE: Plate[] = [
  { id: "tunnel-01",   no: "412", year: "2026", title: "Tunnel No. 7, Konkan",     client: "Konkan Railway",       discipline: "360°",           disciplineLabel: "360° TOUR" },
  { id: "cataract-01", no: "434", year: "2025", title: "Cataract, Theatre 2",      client: "L V Prasad Eye Inst.", discipline: "GIGAPIXEL",      disciplineLabel: "MACRO · GIGAPIXEL" },
  { id: "marwar-01",   no: "401", year: "2025", title: "Last Mile, Marwar",        client: "Gati Limited",         discipline: "INDUSTRIAL",     disciplineLabel: "DOCUMENTARY" },
  { id: "glass-01",    no: "389", year: "2024", title: "Glass Pour, Firozabad",    client: "Triveni Glass",        discipline: "INDUSTRIAL",     disciplineLabel: "INDUSTRIAL" },
  { id: "wankhede-01", no: "374", year: "2024", title: "Wankhede Stadium",         client: "BCCI",                 discipline: "GIGAPIXEL",      disciplineLabel: "GIGAPIXEL" },
  { id: "tooling-01",  no: "362", year: "2024", title: "Injection Tooling, Chakan", client: "Husky",               discipline: "PHOTOGRAMMETRY", disciplineLabel: "PHOTOGRAMMETRY" },
  { id: "refinery-01", no: "358", year: "2023", title: "Refinery No. 4",           client: "IOCL Vadinar",         discipline: "360°",           disciplineLabel: "360° TOUR" },
  { id: "station-01",  no: "341", year: "2023", title: "Train Station Foyer",      client: "MMR Tourism",          discipline: "SPLATS",         disciplineLabel: "GAUSSIAN SPLAT" },
];

/* ---------- Capability categories --------------------------------------- */

export type CategoryKey = "photography" | "vr" | "gigapixel" | "3d";

export type CategoryDemoKind = "iframe" | "image" | "model";

export interface Category {
  key: CategoryKey;
  /** Roman numeral marker shown in the section label */
  numeral: string;
  /** Display name — last word goes italic-ember */
  title: string;
  /** Short mono label ("PHOTOGRAPHY · INDUSTRIAL") */
  short: string;
  /** Section body paragraph */
  body: string;
  /** Total archive count to render in the section meta */
  count: string;
  /** Kind of the inline capability demo — image / iframe / model */
  demoKind: CategoryDemoKind;
  /** Direct URL or local path for the demo. */
  demoSrc: string;
  /** object-position when demoKind is "image" */
  demoObjectPosition?: string;
  /** Optional poster shown behind the "Load this content" gate (mobile mode). */
  demoPoster?: string;
  /** Approximate weight label shown on the gate ("~14 MB"). */
  demoWeight?: string;
}

const R2 = "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev";

export const CATEGORIES: Category[] = [
  {
    key: "photography",
    numeral: "I",
    title: "Industrial photography",
    short: "I · PHOTOGRAPHY · SINCE 1992",
    body: "Annual reports, brand campaigns, plant documentation. The discipline that built the studio — medium-format on assignment, archived to scientific standards.",
    count: "198",
    demoKind: "image",
    demoSrc: "/plates/cataract-01.jpg",
    demoObjectPosition: "50% 50%",
  },
  {
    key: "vr",
    numeral: "II",
    title: "Virtual tours",
    short: "II · 360° TOURS · SINCE 2017",
    body: "Walkable installations delivered to the browser. Hotspot navigation, embedded media, and a viewer that respects the picture — not the gimmick.",
    count: "38",
    demoKind: "iframe",
    demoSrc: `${R2}/portfolio/Praxis%20VRs/Cars_360%20Vr/Jaguar/Jaguar_FXR/Jaguar_FXR.html`,
    demoPoster: `${R2}/portfolio/Praxis%20VRs/Thumbnails%20for%20Web%20Gallereis/Jaguar_XFR.jpg`,
    demoWeight: "360° tour · pano2vr",
  },
  {
    key: "gigapixel",
    numeral: "III",
    title: "Gigapixel imagery",
    short: "III · GIGAPIXEL · SINCE 2014",
    body: "Robotic multi-row capture, stitched to a single dimension-true plate. Wall-sized prints, scientific reference, forensic detail at any zoom.",
    count: "46",
    demoKind: "iframe",
    demoSrc: `${R2}/portfolio/Gigapans/Golconda_Gigapan/Golconda_Gigapan.html`,
    demoWeight: "Gigapixel · zoomable",
  },
  {
    key: "3d",
    numeral: "IV",
    title: "Three-dimensional capture",
    short: "IV · MESHES · SPLATS · SINCE 2019",
    body: "Sub-centimetre meshes and gaussian splat fields. Real-time, web-deliverable, ready for the digital twin, the conservation file, or the museum kiosk.",
    count: "31",
    demoKind: "model",
    demoSrc: `${R2}/portfolio/3D%20Models/tara/Face.glb`,
    demoWeight: "GLB · 9.4 MB",
  },
];

/** Derive a category key from a plate's discipline. */
export function plateCategory(p: Plate): CategoryKey {
  switch (p.discipline) {
    case "INDUSTRIAL":     return "photography";
    case "360°":           return "vr";
    case "GIGAPIXEL":      return "gigapixel";
    case "PHOTOGRAMMETRY":
    case "SPLATS":         return "3d";
  }
}

export function platesByCategory(key: CategoryKey): Plate[] {
  return ARCHIVE.filter((p) => plateCategory(p) === key);
}

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
