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

export interface CaseStudy {
  slug: string;
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

export function getStudyBySlug(slug: string): CaseStudy | undefined {
  return FILE.studies.find((s) => s.slug === slug);
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
