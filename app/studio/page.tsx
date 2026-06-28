import { Accent } from "@/components/Accent";
import { PlateImage } from "@/components/PlateImage";
import { ContactFooter } from "@/components/ContactFooter";
import { PraxivisionFamily } from "@/components/PraxivisionFamily";
import { VaultBrackets } from "@/components/VaultBrackets";
import { VaultInstrFrame } from "@/components/VaultInstrFrame";
import { VaultNav } from "@/components/VaultNav";
import { ViewerSlot } from "@/components/ViewerSlot";
import { OrganizationSchema, AboutPageSchema } from "@/components/SchemaOrg";

export const metadata = {
  title: "Studio",
  description:
    "Praxivision is a heritage documentation studio founded in 1992 in Hyderabad. Photography, gigapixel imagery, 360° tours, photogrammetry, and gaussian splatting for museums and cultural institutions.",
  alternates: { canonical: "https://praxivision.com/studio/" },
  openGraph: {
    title: "About Praxivision — Heritage Documentation Studio · Since 1992",
    description:
      "Praxivision is a heritage documentation studio founded in 1992 in Hyderabad. Photography, gigapixel imagery, 360° tours, photogrammetry, and gaussian splatting.",
    url: "https://praxivision.com/studio/",
    type: "website",
  },
};

type Capability =
  | { kind: "viewer"; tag: string; tHead: string; tTail: string; body: string;
      viewerId: string; caption: string; title: string; cover?: string;
      embedKind?: "iframe" | "model" | "image"; embedSrc?: string }
  | { kind: "plate"; tag: string; tHead: string; tTail: string; body: string;
      plateId: string; label: string; position?: string };

const CAPABILITIES: Capability[] = [
  {
    kind: "plate",
    tag: "PHOTOGRAPHY",
    tHead: "Photography",
    tTail: "of place and process",
    body: "On-site photography for institutions that need their work seen — site, process, people, product. Patient framing, faithful colour, archival masters.",
    plateId: "glass-01",
    position: "50% 55%",
    label: "PHOTOGRAPHY · STUDIO ARCHIVE",
  },
  {
    kind: "viewer",
    tag: "SURFACE",
    tHead: "Gigapixel",
    tTail: "imagery",
    body: "Robotic stitched captures for wall prints, scientific reference, and forensic detail at any zoom. Deep-zoom delivery for the browser.",
    viewerId: "gigapixel-demo",
    caption: "● LIVE · GIGAPIXEL SPECIMEN",
    title: "Gigapixel viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Gigapans/Golconda_Gigapan/Golconda_Gigapan.png",
    embedKind: "iframe",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Gigapans/Golconda_Gigapan/Golconda_Gigapan.html",
  },
  {
    kind: "viewer",
    tag: "PLACE",
    tHead: "360°",
    tTail: "virtual tours",
    body: "Equirectangular tours of heritage sites, museums, plant walkthroughs, and tourism interiors. Browser-deliverable, multi-station.",
    viewerId: "tour360-demo",
    caption: "● LIVE · 360° SPECIMEN",
    title: "360° tour viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Praxis%20VRs/Thumbnails%20for%20Web%20Gallereis/Kamineni_Kingkoti.jpg",
    embedKind: "iframe",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Praxis%20VRs/King_Koti/King_Koti.html",
  },
  {
    kind: "viewer",
    tag: "OBJECT",
    tHead: "Close-range",
    tTail: "photogrammetry",
    body: "Detailed meshes for heritage objects, architectural elements, and industrial subjects. Delivered as standard 3D formats.",
    viewerId: "orbit-demo",
    caption: "● LIVE · PHOTOGRAMMETRY SPECIMEN",
    title: "Photogrammetry orbit viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/3D%20Models/saranath-sthupa/saranath-sthupa.jpg",
    embedKind: "model",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/3D%20Models/saranath-sthupa/Saranath%20Sthupa_web_draco.glb",
  },
  {
    kind: "viewer",
    tag: "LIGHT",
    tHead: "Gaussian",
    tTail: "splats",
    body: "Photoreal radiance-field capture, web-deliverable. Real-time scene reconstruction for sites and objects where photogrammetry struggles.",
    viewerId: "splat-demo",
    caption: "● LIVE · GAUSSIAN SPLAT SPECIMEN",
    title: "Gaussian splat viewer",
    cover: "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/plates/gaussian-splat.png",
    embedKind: "image",
    embedSrc: "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/plates/gaussian-splat.png",
  },
];

const TEAM: [string, string][] = [
  ["B. Sridhar Raju", "Founder · DOP"],
  ["B. Rishi Raju",   "Co-founder · 3D"],
];

const METHOD = [
  { n: "I",   tail: "Brief",    body: "A site visit, a conversation, and a printed checklist. We agree what the photograph is for before we agree what it looks like." },
  { n: "II",  tail: "Capture",  body: "Days or weeks on site, depending on the subject. Tethered medium format, redundant storage, daily proofs." },
  { n: "III", tail: "Review",   body: "Selections shared with the client against the original checklist. Two rounds of feedback, on-record sign-off before strike." },
  { n: "IV",  tail: "Delivery", body: "Press-ready exports, web crops, and archival masters — packaged and catalogued. Held in the studio archive for the life of the work." },
];

export default function StudioPage() {
  return (
    <main style={{ position: "relative" }}>
      <OrganizationSchema />
      <AboutPageSchema />
      <VaultNav active="Studio" />

      {/* HERO */}
      <section
        className="vault-pad"
        style={{ paddingTop: 144, paddingBottom: 96 }}
      >
        <div className="grid gap-10 md:gap-16 grid-cols-1 md:[grid-template-columns:7fr_5fr] md:items-end">
          <div>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.32em",
                color: "var(--vault-ember)",
                marginBottom: 28,
              }}
            >
              — THE STUDIO · HYDERABAD · EST. 1992
            </div>
            <h1 className="h-display-xl" style={{ margin: 0 }}>
              A studio
              <br />
              for <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>institutions.</em>
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
              Praxivision is a heritage documentation studio in{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                Hyderabad,
              </em>{" "}
              practising since{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                1992.
              </em>{" "}
              We make pictures, tours, scans, and splats of the things institutions need
              to keep, share, and explain.
            </p>
          </div>
          <VaultInstrFrame
            label="STUDIO · BEGUMPET"
            code="HYDERABAD"
            exposure="FOUNDER · INTERIOR"
            scale="real space"
            style={{ aspectRatio: "4 / 5", width: "100%" }}
          >
            <PlateImage
              id="studio-hero"
              alt="Praxivision studio interior"
              position="50% 35%"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </VaultInstrFrame>
        </div>
      </section>

      {/* CAPABILITIES */}
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
            01 — CAPABILITIES
          </div>
          <div>
            <h2 className="h-display-m" style={{ margin: 0 }}>
              What the studio
              <br />
              <Accent text="can do." />
            </h2>
            <p
              style={{
                marginTop: 24,
                maxWidth: 780,
                fontWeight: 300,
                fontSize: 20,
                lineHeight: 1.55,
                color: "var(--vault-paper-dim)",
              }}
            >
              Five disciplines under one roof. Live specimens below are real work
              served from the archive.
            </p>
          </div>
        </div>

        {CAPABILITIES.map((c, i) => (
          <div
            key={c.tHead + c.tTail}
            className="grid gap-10 md:gap-16 grid-cols-1 md:[grid-template-columns:5fr_7fr]"
            style={{
              padding: "56px 0 64px",
              borderTop: "1px solid var(--vault-ember)",
            }}
          >
            {/* Left */}
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "var(--vault-ember)",
                }}
              >
                {String(i + 1).padStart(2, "0")} / {String(CAPABILITIES.length).padStart(2, "0")} · {c.tag}
              </div>
              <h3
                style={{
                  marginTop: 14,
                  fontWeight: 300,
                  fontSize: "clamp(36px, 4.5vw, 56px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: "var(--vault-paper)",
                }}
              >
                {c.tHead}{" "}
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {c.tTail}.
                </em>
              </h3>
              <p
                style={{
                  marginTop: 20,
                  maxWidth: 480,
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "var(--vault-paper-dim)",
                }}
              >
                {c.body}
              </p>
            </div>

            {/* Right */}
            <div>
              {c.kind === "viewer" && (
                <>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 10",
                      border: "1px solid var(--vault-rule)",
                    }}
                  >
                    {c.embedKind && c.embedSrc ? (
                      <ViewerSlot
                        kind={c.embedKind}
                        src={c.embedSrc}
                        title={c.title}
                        poster={c.cover}
                      />
                    ) : c.cover ? (
                      <ViewerSlot kind="image" src={c.cover} title={c.title} />
                    ) : (
                      <ViewerSlot id={c.viewerId} title={c.title} />
                    )}
                    <VaultBrackets />
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      marginTop: 12,
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      color: "var(--vault-ember)",
                    }}
                  >
                    {c.caption}
                  </div>
                </>
              )}
              {c.kind === "plate" && (
                <VaultInstrFrame
                  label={c.label}
                  code=""
                  exposure=""
                  style={{ width: "100%", aspectRatio: "16 / 10" }}
                >
                  <PlateImage
                    id={c.plateId}
                    alt={`${c.tHead} ${c.tTail}`}
                    position={c.position}
                    sizes="(max-width: 768px) 100vw, 56vw"
                  />
                </VaultInstrFrame>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* THE STUDIO — address + team */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 80,
          paddingBottom: 112,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-16 grid-cols-1 md:[grid-template-columns:5fr_7fr] items-start">
          <div>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "var(--vault-ember)",
                marginBottom: 28,
              }}
            >
              02 — THE STUDIO
            </div>
            <h2 className="h-display-s" style={{ margin: 0 }}>
              Begumpet,
              <br />
              <Accent text="Hyderabad." />
            </h2>
            <div
              style={{
                marginTop: 40,
                fontSize: 19,
                lineHeight: 1.6,
                color: "var(--vault-paper)",
              }}
            >
              1-11-182, G1, Kamala Palace
              <br />
              Begumpet
              <br />
              Hyderabad — 500016
              <br />
              India
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-8 font-mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
              {[
                ["HOURS", "MON—FRI · 10:00—19:00"],
                ["ARCHIVE", "BY APPOINTMENT"],
                ["PHONE", "+91 94936 34192"],
                ["EMAIL", "praxivision.info@gmail.com"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    borderTop: "1px solid var(--vault-ember)",
                    paddingTop: 10,
                  }}
                >
                  <div style={{ color: "var(--vault-ember)", fontSize: 9 }}>
                    {k}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: "var(--font-display), serif",
                      fontSize: 15,
                      color: "var(--vault-paper)",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <VaultInstrFrame
              label="STUDIO · INTERIOR"
              code="THE FLOOR"
              exposure=""
              style={{ width: "100%", aspectRatio: "16 / 10" }}
            >
              <PlateImage
                id="studio-interior"
                alt="Studio interior"
                sizes="(max-width: 768px) 100vw, 56vw"
              />
            </VaultInstrFrame>

            {/* Team */}
            <div style={{ marginTop: 48 }}>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  color: "var(--vault-ember)",
                  marginBottom: 20,
                }}
              >
                THE CREW
              </div>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {TEAM.map(([name, role]) => (
                  <div
                    key={name}
                    style={{
                      borderTop: "1px solid var(--vault-rule)",
                      paddingTop: 14,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 300,
                        fontSize: 22,
                        letterSpacing: "-0.015em",
                        color: "var(--vault-paper)",
                      }}
                    >
                      {name}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        marginTop: 4,
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        color: "var(--vault-ember)",
                      }}
                    >
                      {role.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 80,
          paddingBottom: 112,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start mb-12">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            03 — METHOD
          </div>
          <h2 className="h-display-s" style={{ margin: 0 }}>
            How we <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>work.</em>
          </h2>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((s, i) => (
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
                <span>STAGE {s.n}</span>
                <span style={{ color: "var(--vault-paper-dim)" }}>
                  0{i + 1} / 04
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

      <PraxivisionFamily current="studio" />
      <ContactFooter />
    </main>
  );
}
