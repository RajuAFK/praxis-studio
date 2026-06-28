import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Accent } from "@/components/Accent";
import { ContactFooter } from "@/components/ContactFooter";
import { VaultNav } from "@/components/VaultNav";
import { PlateImage } from "@/components/PlateImage";
import { VaultInstrFrame } from "@/components/VaultInstrFrame";
import { CreativeWorkSchema } from "@/components/SchemaOrg";
import {
  getAllStudies,
  getStudyBySlug,
  getSections,
  isPublished,
  type CaseStudy,
  type CaseStudySectionType,
} from "@/lib/case-studies";

/** Skip rendering a section if its underlying record has nothing to show. */
function hasSectionContent(study: CaseStudy, type: CaseStudySectionType): boolean {
  switch (type) {
    case "job":     return Boolean(study.jobSummary) || study.specs.length > 0;
    case "method":  return study.phases.length > 0;
    case "plates":  return study.plates.length > 0;
    case "outcome": return Boolean(study.outcomeLede);
  }
}

/**
 * Generate static pages for EVERY case study (drafts included).
 * Drafts get rendered with a noindex meta + a visible "DRAFT" banner so the
 * URL is shareable for preview but excluded from search engines and the
 * public listing/sitemap. Publish flips status — the page re-renders without
 * the banner on the next deploy.
 */
export function generateStaticParams() {
  return getAllStudies().map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getStudyBySlug(slug);
  if (!study) return { title: "Case Study" };
  const published = isPublished(study);
  return {
    title: published
      ? `${study.title} — Case Study`
      : `[DRAFT] ${study.title} — Case Study`,
    description: study.summary,
    // Drafts must not be indexed — they're shareable preview URLs only.
    robots: published ? undefined : { index: false, follow: false, nocache: true },
    openGraph: published
      ? {
          title: `${study.title} — ${study.client}`,
          description: study.summary,
          type: "article",
          url: `https://praxivision.com/case-studies/${study.slug}/`,
        }
      : undefined,
    twitter: published
      ? {
          card: "summary_large_image",
          title: `${study.title} — ${study.client}`,
          description: study.summary,
        }
      : undefined,
    alternates: published
      ? { canonical: `https://praxivision.com/case-studies/${study.slug}/` }
      : undefined,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getStudyBySlug(slug);
  if (!study) notFound();
  return <Detail study={study} />;
}

function Detail({ study }: { study: CaseStudy }) {
  // Pull section ordering from the record; default to the legacy order if missing.
  const sectionsOrdered = getSections(study)
    .filter((s) => s.visible)
    .filter((s) => hasSectionContent(study, s.type));
  // Each section needs a "01 / 02 / …" running label; build the lookup once.
  const numbering = new Map<CaseStudySectionType, string>();
  sectionsOrdered.forEach((s, i) => {
    numbering.set(s.type, String(i + 1).padStart(2, "0"));
  });
  const n = (t: CaseStudySectionType) => numbering.get(t) ?? "—";

  const draft = !isPublished(study);

  return (
    <main style={{ position: "relative" }}>
      {/* CreativeWork schema only for published — drafts shouldn't claim entity status */}
      {!draft && <CreativeWorkSchema study={study} />}
      <VaultNav active="Case Studies" />

      {draft && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--vault-ember)",
            color: "#000",
            padding: "8px 16px",
            textAlign: "center",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            fontWeight: 600,
          }}
        >
          ● DRAFT PREVIEW · NOT PUBLICLY LISTED · NOINDEX
        </div>
      )}

      {/* HERO */}
      <section
        className="vault-pad"
        style={{ paddingTop: 144, paddingBottom: 96 }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.32em",
            color: "var(--vault-ember)",
            marginBottom: 28,
          }}
        >
          <Link
            href="/case-studies"
            style={{ color: "var(--vault-ember)", textDecoration: "none" }}
          >
            ← CASE STUDIES
          </Link>
          <span style={{ marginLeft: 18, color: "var(--vault-paper-dim)" }}>
            {study.kicker}
          </span>
        </div>

        <div className="grid gap-10 md:gap-16 grid-cols-1 md:[grid-template-columns:7fr_5fr] md:items-end">
          <div>
            <h1 className="h-display-xl" style={{ margin: 0 }}>
              {study.titleHead}
              <br />
              <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                {study.titleTail}
              </em>
            </h1>
            <p
              style={{
                marginTop: 40,
                maxWidth: 640,
                fontWeight: 300,
                fontSize: "clamp(17px, 1.8vw, 24px)",
                lineHeight: 1.45,
                color: "var(--vault-paper-dim)",
                textWrap: "pretty",
              }}
            >
              {study.lede}
            </p>
          </div>
          <VaultInstrFrame
            label={study.hero.frameLabel || `${study.title.toUpperCase()} · COVER`}
            code={study.hero.frameCode || "PL.01"}
            exposure={study.hero.frameExposure || study.year}
            scale={study.hero.frameScale || "cover"}
            style={{ aspectRatio: "4 / 5", width: "100%" }}
          >
            <PlateImage
              id={study.hero.plateId || ""}
              alt={study.hero.alt || `${study.client} — ${study.title}`}
              position={study.hero.position}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </VaultInstrFrame>
        </div>
      </section>

      {/* SPECS */}
      {numbering.has("job") && (
      <section
        className="vault-pad"
        style={{
          paddingTop: 64,
          paddingBottom: 96,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            {n("job")} — THE JOB
          </div>
          <div>
            <p
              style={{
                fontWeight: 300,
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {study.jobSummary}
            </p>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-12" style={{ maxWidth: 720 }}>
              {study.specs.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    borderTop: "1px solid var(--vault-ember)",
                    paddingTop: 10,
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      color: "var(--vault-ember)",
                    }}
                  >
                    {k.toUpperCase()}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 16,
                      color: "var(--vault-paper)",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* PHASES */}
      {numbering.has("method") && (
      <section
        className="vault-pad"
        style={{
          paddingTop: 80,
          paddingBottom: 96,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start mb-8">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            {n("method")} — METHOD
          </div>
          <h2 className="h-display-m" style={{ margin: 0 }}>
            {study.phasesHeader}
            <br />
            <Accent text={study.phasesHeaderAccent} />
          </h2>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {study.phases.map((s, i) => (
            <div
              key={s.n}
              style={{
                borderTop: "1px solid var(--vault-ember)",
                paddingTop: 18,
              }}
            >
              <div
                className="font-mono"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "var(--vault-ember)",
                }}
              >
                <span>PHASE {s.n}</span>
                <span style={{ color: "var(--vault-paper-dim)" }}>
                  {String(i + 1).padStart(2, "0")} / {String(study.phases.length).padStart(2, "0")}
                </span>
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontWeight: 300,
                  fontSize: 40,
                  letterSpacing: "-0.025em",
                  lineHeight: 1,
                }}
              >
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {s.tail}.
                </em>
              </div>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--vault-paper-dim)",
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* PLATE GRID */}
      {numbering.has("plates") && (
        <section
          className="vault-pad"
          style={{
            paddingTop: 80,
            paddingBottom: 96,
            borderTop: "1px solid var(--vault-rule)",
          }}
        >
          <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start mb-8">
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "var(--vault-ember)",
              }}
            >
              {n("plates")} — PLATES
            </div>
            <div>
              <h2 className="h-display-m" style={{ margin: 0 }}>
                {study.platesHeader}{" "}
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {study.platesHeaderAccent}
                </em>
              </h2>
              <p
                style={{
                  marginTop: 24,
                  maxWidth: 720,
                  fontWeight: 300,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: "var(--vault-paper-dim)",
                }}
              >
                {study.platesIntro}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {study.plates.map((p) => (
              <div key={p.plateId || p.src || p.label}>
                <VaultInstrFrame
                  label={p.label}
                  code={`${study.client.split(" ")[0].toUpperCase()} · ${study.year}`}
                  exposure={study.instruments.split(" · ")[0]}
                  style={{ width: "100%", aspectRatio: "4 / 5" }}
                >
                  <PlateImage
                    id={p.plateId || ""}
                    alt={p.label}
                    position={p.position}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </VaultInstrFrame>
                <div
                  className="font-mono"
                  style={{
                    marginTop: 12,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    color: "var(--vault-paper-dim)",
                  }}
                >
                  {p.caption}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OUTCOME */}
      {numbering.has("outcome") && (
      <section
        className="vault-pad"
        style={{
          paddingTop: 80,
          paddingBottom: 112,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            {n("outcome")} — OUTCOME
          </div>
          <div>
            <p
              style={{
                fontWeight: 300,
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {study.outcomeLede}
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Back to case studies — always shown, decoupled from any section */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 32,
          paddingBottom: 96,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <Link
          href="/case-studies"
          className="font-mono"
          style={{
            color: "var(--vault-ember)",
            textDecoration: "none",
            fontSize: 11,
            letterSpacing: "0.28em",
          }}
        >
          ← BACK TO CASE STUDIES
        </Link>
      </section>

      <ContactFooter />
    </main>
  );
}
