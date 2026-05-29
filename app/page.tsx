import { Accent } from "@/components/Accent";
import { Capabilities } from "@/components/Capabilities";
import { ClientList } from "@/components/ClientList";
import { ContactFooter } from "@/components/ContactFooter";
import { HeroSwitcher } from "@/components/HeroSwitcher";
import { VaultNav } from "@/components/VaultNav";

const STATS: [string, string][] = [
  ["33", "YEARS ON ASSIGNMENT"],
  ["143", "CLIENT INSTITUTIONS"],
  ["4", "INSTRUMENTS"],
];

/* Ordered left → middle → right so Praxis Studio sits as the central
   node, with TIV branching off to its left and P3D to its right. */
const TREE = [
  { key: "tiv",    name: "Tour It Virtually",     tail: "Virtually",   year: "2017", tag: "HERITAGE",    urlLabel: "touritvirtually.com", current: false },
  { key: "studio", name: "Praxis Studio",         tail: "Studio",      year: "1992", tag: "PHOTOGRAPHY", urlLabel: null,                   current: true  },
  { key: "p3d",    name: "Praxis 3D Informatics", tail: "Informatics", year: "2024", tag: "VOLUMETRICS", urlLabel: "praxis3d.in",          current: false },
];

/* Fixed pixel width for each sister box so the row is perfectly symmetrical
   and so the parent's vertical drop lines up with the centre box. */
const SISTER_BOX_W = 240;
const HORIZ_CONNECTOR_W = 48;

export default function HomePage() {
  return (
    <main style={{ position: "relative" }}>
      <VaultNav active="Work" />
      <HeroSwitcher />

      {/* STATEMENT */}
      <section
        className="vault-pad"
        style={{ paddingTop: 96, paddingBottom: 80 }}
      >
        <div className="grid gap-10 md:gap-20 lg:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-start">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            01 — THE STUDIO
          </div>
          <div>
            <p
              style={{
                fontWeight: 300,
                fontSize: "clamp(24px, 3.4vw, 40px)",
                lineHeight: 1.2,
                letterSpacing: "-0.018em",
                margin: 0,
                color: "var(--vault-paper)",
                textWrap: "pretty",
              }}
            >
              Praxis Studio has been making pictures of industry since{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                1992.
              </em>{" "}
              Today we are a department of{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                Praxivision Private Limited,
              </em>{" "}
              alongside Tour It Virtually and Praxis 3D Informatics.
            </p>
            <div
              className="grid gap-8 md:gap-10 grid-cols-2 md:grid-cols-3 mt-12 md:mt-16 font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
              }}
            >
              {STATS.map(([n, l]) => (
                <div key={l}>
                  <div
                    style={{
                      fontFamily: "var(--font-display), serif",
                      fontWeight: 300,
                      fontSize: "clamp(44px, 5.2vw, 68px)",
                      lineHeight: 0.95,
                      letterSpacing: "-0.04em",
                      color: "var(--vault-paper)",
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      color: "var(--vault-paper-dim)",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Capabilities />

      {/* FAMILY TREE */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 96,
          paddingBottom: 140,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] items-baseline mb-16 md:mb-24">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            03 — FAMILY TREE
          </div>
          <div>
            <h2 className="h-display-m" style={{ margin: 0 }}>
              One parent,
              <br />
              <Accent text="three doors." />
            </h2>
            <p
              style={{
                marginTop: 24,
                maxWidth: 720,
                fontWeight: 300,
                fontSize: 20,
                lineHeight: 1.55,
                color: "var(--vault-paper-dim)",
              }}
            >
              Praxis Studio is one of three departments under{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                Praxivision Private Limited
              </em>
              . Same crews, same archive — three doors for three disciplines.
            </p>
          </div>
        </div>

        {/* Tree — dark/ember styling, T-shape layout. Wrapper is sized to the
            children row (3 × 240 + 2 × 48 = 816px) so the parent's centre,
            the vertical drop, and the centre child all align on the same axis. */}
        <div
          style={{
            width: `min(${SISTER_BOX_W * 3 + HORIZ_CONNECTOR_W * 2}px, 100%)`,
            margin: "0 auto",
          }}
        >
          {/* Desktop */}
          <div className="hidden md:flex flex-col items-center">
            <ParentBox />

            {/* Vertical drop from Parent to Studio */}
            <div
              style={{
                width: 1,
                height: 64,
                background: "var(--vault-ember)",
              }}
            />

            {/* Sister row: TIV — STUDIO — P3D, equal-width boxes + connectors */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {TREE.map((s, i) => (
                <div
                  key={s.key}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {i > 0 && (
                    <div
                      style={{
                        width: HORIZ_CONNECTOR_W,
                        height: 1,
                        background: "var(--vault-ember)",
                      }}
                    />
                  )}
                  <SisterBox s={s} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: parent → studio (highlighted) → sisters */}
          <div className="md:hidden flex flex-col items-center">
            <ParentBox compact />
            <div
              style={{ width: 1, height: 36, background: "var(--vault-ember)" }}
            />
            <SisterBox s={TREE.find((t) => t.current)!} />
            {TREE.filter((t) => !t.current).map((s) => (
              <div
                key={s.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 1,
                    height: 28,
                    background: "var(--vault-ember)",
                  }}
                />
                <SisterBox s={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ClientList />
      <ContactFooter />
    </main>
  );
}

function ParentBox({ compact }: { compact?: boolean } = {}) {
  return (
    <div
      style={{
        border: "1px solid var(--vault-ember)",
        padding: compact ? "20px 24px" : "26px 48px",
        textAlign: "center",
        // Match the desktop children-row width so the parent sits exactly above the centre child
        width: compact ? "100%" : SISTER_BOX_W * 2,
        maxWidth: compact ? 360 : undefined,
        boxSizing: "border-box",
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "var(--vault-ember)",
        }}
      >
        PARENT · 2025
      </div>
      <div
        style={{
          marginTop: 12,
          fontWeight: 300,
          fontSize: compact ? 28 : 44,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: "var(--vault-paper)",
        }}
      >
        Praxivision{" "}
        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
          Pvt Ltd.
        </em>
      </div>
      {!compact && (
        <div
          className="font-mono"
          style={{
            marginTop: 12,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--vault-paper-dim)",
          }}
        >
          HYDERABAD · INDIA · HOLDING COMPANY
        </div>
      )}
    </div>
  );
}

function SisterBox({ s }: { s: (typeof TREE)[number] }) {
  return (
    <div
      style={{
        // All three boxes share the same dim border so they read as
        // visually consistent peers; Studio is distinguished only by the
        // soft ember bg tint and the "YOU ARE HERE" badge below.
        border: "1px solid var(--vault-rule)",
        background: s.current ? "rgba(217,106,42,0.05)" : "transparent",
        padding: "20px 22px",
        textAlign: "center",
        width: SISTER_BOX_W,
        boxSizing: "border-box",
        maxWidth: "100%",
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-ember)",
        }}
      >
        PV · {s.tag}
      </div>
      <div
        style={{
          marginTop: 12,
          fontWeight: 300,
          fontSize: 22,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "var(--vault-paper)",
          // Reserve space so all three boxes are the same height even when
          // one name wraps to two lines and another doesn't.
          minHeight: "2.4em",
        }}
      >
        {s.name.replace(s.tail, "")}
        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
          {s.tail}
        </em>
      </div>
      <div
        className="font-mono"
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: "1px solid var(--vault-rule)",
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-paper-dim)",
        }}
      >
        SINCE {s.year}
      </div>
      {s.current ? (
        <div
          className="font-mono"
          style={{
            marginTop: 10,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--vault-ember)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span
            className="vault-live"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--vault-ember)",
              boxShadow: "0 0 8px var(--vault-ember)",
            }}
          />
          YOU ARE HERE
        </div>
      ) : (
        <div
          className="font-mono"
          style={{
            marginTop: 10,
            fontSize: 10,
            letterSpacing: "0.22em",
          }}
        >
          <span className="vault-link" style={{ color: "var(--vault-paper)" }}>
            {s.urlLabel} →
          </span>
        </div>
      )}
    </div>
  );
}
