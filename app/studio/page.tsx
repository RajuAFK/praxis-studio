import { Accent } from "@/components/Accent";
import { PlateImage } from "@/components/PlateImage";
import { ContactFooter } from "@/components/ContactFooter";
import { PraxivisionFamily } from "@/components/PraxivisionFamily";
import { VaultBrackets } from "@/components/VaultBrackets";
import { VaultInstrFrame } from "@/components/VaultInstrFrame";
import { VaultNav } from "@/components/VaultNav";
import { VaultPlate } from "@/components/VaultPlate";
import { ViewerSlot } from "@/components/ViewerSlot";

export const metadata = {
  title: "Studio — Praxis Studio",
};

type Milestone =
  | { kind: "plate"; year: string; tag: string; tHead: string; tTail: string; body: string; specs: [string, string][]; plateId: string; position?: string; label: string; code: string; exposure?: string; scale?: string }
  | { kind: "viewer"; year: string; tag: string; tHead: string; tTail: string; body: string; specs: [string, string][]; viewerId: string; caption: string; title: string; cover?: string; embedKind?: "iframe" | "model" | "image"; embedSrc?: string }
  | { kind: "family"; year: string; tag: string; tHead: string; tTail: string; body: string; specs: [string, string][] };

const MILESTONES: Milestone[] = [
  {
    kind: "plate",
    year: "1992", tag: "FOUNDATION",
    tHead: "Studio", tTail: "founded",
    body: "Praxis Studio opens in a single room in Jubilee Hills, Hyderabad. Hasselblad 503CW, an 80mm Planar, a Manfrotto, and ninety rolls of Kodak Plus-X. The discipline is photography of industry — and remains so to this day.",
    specs: [["Format", "Hasselblad 503CW"], ["Process", "Film + drum scan"]],
    plateId: "glass-01", position: "50% 55%",
    label: "GLASS POUR · PL.389", code: "1/8s · ƒ5.6 · ISO 200", scale: "1.8 m",
  },
  {
    kind: "plate",
    year: "2003", tag: "TRANSITION",
    tHead: "Digital medium", tTail: "format",
    body: "First Hasselblad H1 with a Phase One back. The studio commits to high-resolution medium format and never looks back. Throughput doubles; the archive grows tenfold inside a decade.",
    specs: [["Cameras", "H1 → H6D-100c"], ["Process", "100MP MF · tethered"]],
    plateId: "cataract-01", position: "40% 60%",
    label: "SURGICAL MACRO · PL.434", code: "PHASE ONE IQ4 · 100MP", scale: "6 mm",
  },
  {
    kind: "viewer",
    year: "2014", tag: "SURFACE",
    tHead: "Gigapixel", tTail: "capture",
    body: "GigaPan robotic head added. First gigapixel commission: a 2.4 GP stitched portrait of a Tata Steel coke-oven battery. Now used for wall prints, scientific reference, and forensic detail at any zoom.",
    specs: [["Resolution", "1.8–4.2 GP"], ["Capture", "GigaPan robotic"], ["Stitch", "24–64 tiles · PTGui"], ["Delivery", "Tiled deep-zoom"]],
    viewerId: "gigapixel-demo",
    caption: "GIGAPIXEL · 1.8 GP · 24 TILES",
    title: "Gigapixel viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Gigapans/Golconda_Gigapan/Golconda_Gigapan.png",
    embedKind: "iframe",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Gigapans/Golconda_Gigapan/Golconda_Gigapan.html",
  },
  {
    kind: "viewer",
    year: "2017", tag: "PLACE",
    tHead: "360° virtual", tTail: "tours",
    body: "Insta360 rig plus a custom Krpano pipeline. Tour It Virtually established as a dedicated service line — heritage sites, museums, plant walkthroughs, and tourism boards.",
    specs: [["Coverage", "Equirect 8K"], ["Capture", "Insta360 X4 + HDR"], ["Tours", "10–40 stations"], ["Delivery", "Krpano · web"]],
    viewerId: "tour360-demo",
    caption: "KING KOTI HERITAGE TOUR",
    title: "360° tour viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Praxis%20VRs/Thumbnails%20for%20Web%20Gallereis/Kamineni_Kingkoti.jpg",
    embedKind: "iframe",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/Praxis%20VRs/King_Koti/King_Koti.html",
  },
  {
    kind: "viewer",
    year: "2019", tag: "OBJECT",
    tHead: "Close-range", tTail: "photogrammetry",
    body: "Phase One IQ4 plus Metashape. First conservation-grade mesh for the Archaeological Survey of India. Sub-centimetre tolerance, on objects from a coin to a courtyard.",
    specs: [["Tolerance", "0.5–2.0 mm"], ["Capture", "Phase One IQ4"], ["Process", "Metashape · RC"], ["Delivery", "OBJ · GLB · USD"]],
    viewerId: "orbit-demo",
    caption: "SARANATH STHUPA · ASI ARCHIVE",
    title: "Photogrammetry orbit viewer",
    cover:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/3D%20Models/saranath-sthupa/saranath-sthupa.jpg",
    embedKind: "model",
    embedSrc:
      "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/portfolio/3D%20Models/saranath-sthupa/Saranath%20Sthupa_web_draco.glb",
  },
  {
    kind: "viewer",
    year: "2024", tag: "LIGHT",
    tHead: "Gaussian", tTail: "splats",
    body: "A multi-camera array, a small drone fleet, and the patience to train radiance fields. Real-time, web-deliverable, and unsettling in their fidelity. The current frontier of the studio.",
    specs: [["Splat count", "100K – 2M"], ["Capture", "Multi-cam array + drone"], ["Train", "nerfstudio / gsplat"], ["Delivery", "PLY · web · Unreal"]],
    viewerId: "splat-demo",
    caption: "420K SPLATS · 60FPS",
    title: "Gaussian splat viewer",
    cover: "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/plates/gaussian-splat.png",
    embedKind: "image",
    embedSrc: "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev/plates/gaussian-splat.png",
  },
  {
    kind: "family",
    year: "2025", tag: "FAMILY",
    tHead: "Praxivision", tTail: "Pvt. Ltd.",
    body: "Praxis Studio, Tour It Virtually, and Praxis 3D Informatics consolidate under one parent. Same crews, same archive, three doors. Heritage and 3D are formally recognised as their own departments.",
    specs: [],
  },
];

const TEAM: [string, string, string][] = [
  ["B. Sridhar Raju", "Founder · DOP",     "On the camera since 1992. Has spent more time inside industrial sites than most engineers who built them."],
  ["B. Rishi Raju",   "Co-founder · 3D",   "Heritage, photogrammetry, gaussian splats, and the web pipeline that puts them in your browser."],
];

const METHOD = [
  { n: "I",   tail: "Brief",    body: "A site visit, a conversation, and a printed checklist. We agree what the photograph is for before we agree what it looks like." },
  { n: "II",  tail: "Capture",  body: "Days or weeks on site, depending on the subject. Tethered medium format, redundant storage, daily proofs." },
  { n: "III", tail: "Review",   body: "Selections shared with the client against the original checklist. Two rounds of feedback, on-record sign-off before strike." },
  { n: "IV",  tail: "Delivery", body: "TIFF 16-bit masters, print-ready exports, web crops, and the annual-report selects — handed over packaged and catalogued. Held in the studio archive for the life of the work." },
];

export default function StudioPage() {
  return (
    <main style={{ position: "relative" }}>
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
              Thirty-three
              <br />
              years of <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>light.</em>
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
              Praxis Studio was founded in{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                1992
              </em>{" "}
              to make photographs of Indian industry — the foundries, refineries,
              factories and infrastructure that most photographers do not visit,
              photographed with the patience the subject deserves.
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
              alt="Sridhar Raju, founder of Praxis Studio"
              position="50% 35%"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </VaultInstrFrame>
        </div>
      </section>

      {/* ORIGIN */}
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
            01 — ORIGIN
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
              The studio began with one camera, one tripod, and the discipline of
              going to the{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                site.
              </em>
            </p>
            <div
              className="grid gap-10 md:gap-16 grid-cols-1 md:grid-cols-2 mt-12"
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--vault-paper-dim)",
                textWrap: "pretty",
              }}
            >
              <p style={{ margin: 0 }}>
                For the first decade we worked almost exclusively on annual
                reports — board portraits, balance-sheet covers, the kind of
                pictures that required equal parts patience and corporate
                diplomacy. The cameras were Hasselblads and the format was film.
              </p>
              <p style={{ margin: 0 }}>
                The aughts brought digital, then high-resolution medium format,
                then a string of long-term documentation projects with India&apos;s
                heavy industry. We learned to live for weeks at a time inside
                steel plants, fertilizer factories, and oil refineries.
              </p>
              <p style={{ margin: 0 }}>
                Gigapixel imagery arrived in 2014; tour photography in 2017;
                photogrammetry in 2019; gaussian splats in 2024. Each new
                instrument was an answer to a question a client could not
                previously ask.
              </p>
              <p style={{ margin: 0 }}>
                In 2025 the studio became a department of{" "}
                <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                  Praxivision Private Limited
                </em>
                , together with Tour It Virtually and Praxis 3D Informatics.
                Photography is still the spine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INSTRUMENTS GAINED */}
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
            02 — INSTRUMENTS, GAINED
          </div>
          <div>
            <h2 className="h-display-m" style={{ margin: 0 }}>
              Seven milestones,
              <br />
              <Accent text="five instruments." />
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
              Over thirty-three years we have added one new tool roughly every
              five — when a question came up that the existing kit could not
              answer. Live specimens of each are below.
            </p>
          </div>
        </div>

        {MILESTONES.map((m, i) => (
          <div
            key={m.year}
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
                {String(i + 1).padStart(2, "0")} / 07 · {m.tag}
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
                {m.tHead}{" "}
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {m.tTail}.
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
                {m.body}
              </p>
              {m.specs.length > 0 && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-8" style={{ maxWidth: 520 }}>
                  {m.specs.map(([k, v]) => (
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
              )}
            </div>

            {/* Right */}
            <div>
              {m.kind === "viewer" && (
                <>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 10",
                      border: "1px solid var(--vault-rule)",
                    }}
                  >
                    {m.embedKind && m.embedSrc ? (
                      <ViewerSlot
                        kind={m.embedKind}
                        src={m.embedSrc}
                        title={m.title}
                        poster={m.cover}
                      />
                    ) : m.cover ? (
                      <ViewerSlot kind="image" src={m.cover} title={m.title} />
                    ) : (
                      <ViewerSlot id={m.viewerId} title={m.title} />
                    )}
                    <VaultBrackets />
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      justifyContent: "space-between",
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      color: "var(--vault-paper-dim)",
                    }}
                  >
                    <span style={{ color: "var(--vault-ember)" }}>
                      ● LIVE · INTERACT WITH THE FRAME
                    </span>
                    <span>{m.caption}</span>
                  </div>
                </>
              )}
              {m.kind === "plate" && (
                <VaultInstrFrame
                  label={m.label}
                  code={m.code}
                  exposure={m.exposure || ""}
                  scale={m.scale}
                  style={{ width: "100%", aspectRatio: "16 / 10" }}
                >
                  <PlateImage
                    id={m.plateId}
                    alt={`${m.tHead} ${m.tTail}`}
                    position={m.position}
                    sizes="(max-width: 768px) 100vw, 56vw"
                  />
                </VaultInstrFrame>
              )}
              {m.kind === "family" && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 w-full">
                  {[
                    { n: "Praxis Studio",         tail: "Studio",      id: "glass-01",   pos: "50% 55%", label: "PV.01", tag: "PHOTOGRAPHY", here: true },
                    { n: "Tour It Virtually",     tail: "Virtually",   id: "tunnel-01",  pos: "60% 50%", label: "PV.02", tag: "HERITAGE", here: false },
                    { n: "Praxis 3D Informatics", tail: "Informatics", id: "tooling-01", pos: "50% 50%", label: "PV.03", tag: "VOLUMETRICS", here: false },
                  ].map((s) => (
                    <div key={s.n}>
                      <VaultPlate
                        plateId={s.id}
                        plateNo={s.label}
                        alt={s.n}
                        caption={s.here ? "● YOU ARE HERE" : "SISTER"}
                        position={s.pos}
                        style={{ aspectRatio: "4 / 5", width: "100%" }}
                        sizes="(max-width: 640px) 100vw, 18vw"
                      />
                      <div
                        className="font-mono"
                        style={{
                          marginTop: 12,
                          fontSize: 9,
                          letterSpacing: "0.22em",
                          color: "var(--vault-ember)",
                        }}
                      >
                        {s.tag}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 18,
                          fontWeight: 300,
                          letterSpacing: "-0.015em",
                          lineHeight: 1,
                        }}
                      >
                        {s.n.replace(s.tail, "")}
                        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                          {s.tail}
                        </em>
                      </div>
                    </div>
                  ))}
                </div>
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
              03 — THE STUDIO
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
              code="04 · THE FLOOR"
              exposure="THE FLOOR"
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
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {TEAM.map(([name, role, note]) => (
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
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "var(--vault-paper-dim)",
                      }}
                    >
                      {note}
                    </p>
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
            04 — METHOD
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
