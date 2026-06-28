import Link from "next/link";
import type { Metadata } from "next";
import { Accent } from "@/components/Accent";
import { ContactFooter } from "@/components/ContactFooter";
import { VaultNav } from "@/components/VaultNav";
import { PlateImage } from "@/components/PlateImage";
import { VaultBrackets } from "@/components/VaultBrackets";
import { getAllStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Selected commissions from Praxivision — heritage documentation, 360° tours, photogrammetry, gaussian splats, and archival photography for cultural institutions and industry.",
  openGraph: {
    title: "Case Studies — Praxivision",
    description:
      "Selected commissions across heritage documentation, 360° tours, photogrammetry, gaussian splats, and archival photography.",
    type: "website",
    url: "https://praxivision.com/case-studies/",
  },
  alternates: {
    canonical: "https://praxivision.com/case-studies/",
  },
};

export default function CaseStudiesIndexPage() {
  const STUDIES = getAllStudies();
  return (
    <main style={{ position: "relative" }}>
      <VaultNav active="Case Studies" />

      {/* Header */}
      <section
        className="vault-pad"
        style={{ paddingTop: 144, paddingBottom: 64 }}
      >
        <div className="grid gap-8 md:gap-16 grid-cols-1 md:[grid-template-columns:2fr_1fr] md:items-end">
          <div
            className="font-mono md:order-2 md:text-right"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            CASE STUDIES · {STUDIES.length}{" "}
            {STUDIES.length === 1 ? "ENTRY" : "ENTRIES"}
          </div>
          <h1 className="h-display-xl md:order-1" style={{ margin: 0 }}>
            Selected
            <br />
            <Accent text="works." />
          </h1>
        </div>
        <p
          style={{
            marginTop: 40,
            maxWidth: 720,
            fontWeight: 300,
            fontSize: "clamp(17px, 1.8vw, 22px)",
            lineHeight: 1.5,
            color: "var(--vault-paper-dim)",
            textWrap: "pretty",
          }}
        >
          Projects the studio is proud of — paid commissions,
          partnerships, and longer-running pro-bono efforts. Each told end to
          end: brief, instruments, days on site, and what the work produced.
        </p>
      </section>

      {/* List */}
      <section className="vault-pad" style={{ paddingBottom: 144 }}>
        <div className="grid gap-10 md:gap-14 grid-cols-1">
          {STUDIES.map((s, i) => (
            <Link
              key={s.slug}
              href={`/case-studies/${s.slug}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "var(--vault-paper)",
                borderTop: "1px solid var(--vault-ember)",
                paddingTop: 18,
              }}
              className="vault-row"
            >
              <div
                className="font-mono"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "var(--vault-ember)",
                  marginBottom: 18,
                }}
              >
                <span>
                  {String(i + 1).padStart(2, "0")} / {String(STUDIES.length).padStart(2, "0")} · {s.tag}
                </span>
                <span style={{ color: "var(--vault-paper-dim)" }}>{s.year}</span>
              </div>

              <div className="grid gap-6 md:gap-10 grid-cols-1 md:[grid-template-columns:5fr_7fr] md:items-start">
                <div
                  className="vault-plate"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    background: "#0a0a0a",
                    overflow: "hidden",
                  }}
                >
                  <PlateImage
                    id={s.hero.thumbPlateId || s.hero.plateId || ""}
                    alt={`${s.client} — ${s.title}`}
                    position={s.hero.position || "50% 50%"}
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <VaultBrackets />
                  <div className="vault-plate-meta">
                    <span>OPEN CASE STUDY →</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    className="vault-row-title"
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(34px, 4.4vw, 56px)",
                      letterSpacing: "-0.025em",
                      lineHeight: 1,
                    }}
                  >
                    {s.titleHead}{" "}
                    <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                      {s.titleTail}
                    </em>
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      marginTop: 12,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      color: "var(--vault-paper-dim)",
                    }}
                  >
                    {s.client.toUpperCase()}
                  </div>

                  <p
                    style={{
                      marginTop: 18,
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: "var(--vault-paper-dim)",
                      maxWidth: 560,
                    }}
                  >
                    {s.summary}
                  </p>

                  <div
                    className="font-mono"
                    style={{
                      marginTop: 28,
                      paddingTop: 18,
                      borderTop: "1px solid var(--vault-rule)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                    }}
                  >
                    <span style={{ color: "var(--vault-paper)" }}>
                      {s.instruments.toUpperCase()}
                    </span>
                    <span style={{ color: "var(--vault-ember)" }}>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ContactFooter />
    </main>
  );
}
