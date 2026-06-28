import data from "@/data/case-studies.json";
import { plateUrl } from "@/lib/r2";

export type CaseStudySpec = [string, string];

export interface CaseStudyPhase {
  n: string;
  tail: string;
  body: string;
}

export interface CaseStudyImageRef {
  plateId?: string;
  thumbPlateId?: string;
  src?: string;
  alt?: string;
  position?: string;
  frameLabel?: string;
  frameCode?: string;
  frameExposure?: string;
  frameScale?: string;
}

export interface CaseStudyPlate {
  plateId?: string;
  src?: string;
  label: string;
  caption: string;
  position?: string;
}

export type CaseStudyStatus = "draft" | "published";

/**
 * Toggleable / reorderable section types on the case-study detail page.
 * The hero is always rendered first and always visible — it's not part of
 * the toggleable set. Everything else can be hidden or reordered through
 * the admin layout editor.
 */
export type CaseStudySectionType = "job" | "method" | "plates" | "outcome";

export interface CaseStudySection {
  type: CaseStudySectionType;
  visible: boolean;
}

/** Default section order applied when a record omits the field. */
export const DEFAULT_SECTIONS: CaseStudySection[] = [
  { type: "job",     visible: true },
  { type: "method",  visible: true },
  { type: "plates",  visible: true },
  { type: "outcome", visible: true },
];

export interface CaseStudy {
  slug: string;
  /** Defaults to "published" when missing (back-compat with v1 records). */
  status?: CaseStudyStatus;
  /** Defaults to DEFAULT_SECTIONS when missing. */
  sections?: CaseStudySection[];
  client: string;
  title: string;
  titleHead: string;
  titleTail: string;
  year: string;
  tag: string;
  instruments: string;
  summary: string;
  lede: string;
  kicker: string;
  hero: CaseStudyImageRef;
  jobSummary: string;
  specs: CaseStudySpec[];
  phasesHeader: string;
  phasesHeaderAccent: string;
  phases: CaseStudyPhase[];
  platesHeader: string;
  platesHeaderAccent: string;
  platesIntro: string;
  plates: CaseStudyPlate[];
  outcomeLede: string;
}

interface CaseStudyFile {
  version: number;
  studies: CaseStudy[];
}

const FILE = data as CaseStudyFile;

export function getAllStudies(): CaseStudy[] {
  return FILE.studies;
}

/** Anything visible to the public — listing, sitemap, static-params all use this. */
export function getPublishedStudies(): CaseStudy[] {
  return FILE.studies.filter((s) => (s.status ?? "published") === "published");
}

export function getStudyBySlug(slug: string): CaseStudy | undefined {
  return FILE.studies.find((s) => s.slug === slug);
}

export function isPublished(s: CaseStudy): boolean {
  return (s.status ?? "published") === "published";
}

export function getSections(s: CaseStudy): CaseStudySection[] {
  return s.sections && s.sections.length > 0 ? s.sections : DEFAULT_SECTIONS;
}

export function getStudySlugs(): string[] {
  return FILE.studies.map((s) => s.slug);
}

/**
 * Resolve a case-study image reference to a usable URL.
 * - `src` (absolute or root-relative path) takes precedence — that's how the
 *   PHP admin will hand over Hostinger-filesystem uploads under
 *   /case-studies-media/[slug]/...
 * - `plateId` falls back to the R2 plates pipeline used elsewhere on the site.
 */
export function imageUrl(ref: { plateId?: string; src?: string }): string {
  if (ref.src) return ref.src;
  if (ref.plateId) return plateUrl(ref.plateId);
  return "";
}
