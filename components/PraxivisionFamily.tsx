import Image from "next/image";
import { SISTERS, type Sister } from "@/lib/sisters";
import { Accent } from "./Accent";
import { VaultBrackets } from "./VaultBrackets";

export function PraxivisionFamily({
  current = "studio",
}: {
  current?: Sister["key"];
}) {
  return (
    <section
      className="vault-pad"
      style={{
        paddingTop: 96,
        paddingBottom: 120,
        borderTop: "1px solid var(--vault-rule)",
      }}
    >
      <div
        className="grid gap-10 md:gap-16 lg:gap-24 mb-12 md:mb-16"
        style={{ gridTemplateColumns: "minmax(0, 1fr)" }}
      >
        <div
          className="md:grid md:[grid-template-columns:1fr_2fr] md:gap-24 md:items-baseline"
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
              marginBottom: 24,
            }}
          >
            05 — FAMILY · INSIDE PRAXIVISION P.L.
          </div>
          <div>
            <h2 className="h-display-m" style={{ margin: 0 }}>
              Three departments,
              <br />
              <Accent text="one studio." />
            </h2>
            <p
              style={{
                marginTop: 28,
                maxWidth: 780,
                fontSize: 20,
                lineHeight: 1.55,
                color: "var(--vault-paper-dim)",
              }}
            >
              Praxis Studio sits inside{" "}
              <em style={{ fontStyle: "italic", color: "var(--vault-paper)" }}>
                Praxivision Private Limited
              </em>{" "}
              alongside two sister departments. Photography is the foundation;
              heritage and 3D are its natural extensions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {SISTERS.map((s, i) => {
          const isCurrent = s.key === current;
          const isLink = !!s.url;
          const cardInner = (
            <>
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
                <span>PRAXIVISION · 0{i + 1}</span>
                <span style={{ color: "var(--vault-paper-dim)" }}>
                  EST. {s.year}
                </span>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  background: isCurrent
                    ? "rgba(217,106,42,0.04)"
                    : "rgba(255,255,255,0.015)",
                  border: "1px solid var(--vault-rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14% 18%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    fill
                    sizes="(max-width: 768px) 90vw, 28vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <VaultBrackets />
                <div
                  className="font-mono"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 12,
                    right: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    color: "var(--vault-paper-dim)",
                  }}
                >
                  <span style={{ color: "var(--vault-ember)" }}>PV.0{i + 1}</span>
                  <span>{isCurrent ? "● YOU ARE HERE" : "VISIT →"}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 22,
                  fontWeight: 300,
                  fontSize: 36,
                  letterSpacing: "-0.025em",
                  lineHeight: 1,
                }}
              >
                {s.name.replace(s.tail, "")}
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {s.tail}
                </em>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  fontStyle: "italic",
                  color: "var(--vault-paper-dim)",
                }}
              >
                {s.tagline}
              </div>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--vault-paper-dim)",
                  flex: 1,
                }}
              >
                {s.body}
              </p>
              <div
                className="font-mono"
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: "1px solid var(--vault-rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                }}
              >
                <span style={{ color: "var(--vault-ember)" }}>{s.tag}</span>
                {isCurrent ? (
                  <span
                    style={{
                      color: "var(--vault-paper-dim)",
                      display: "flex",
                      alignItems: "center",
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
                    THE STUDIO YOU&rsquo;RE IN
                  </span>
                ) : s.urlLabel ? (
                  <span className="vault-link" style={{ color: "var(--vault-paper)" }}>
                    {s.urlLabel} →
                  </span>
                ) : (
                  <span style={{ color: "var(--vault-paper-dim)" }}>
                    SISTER DEPARTMENT
                  </span>
                )}
              </div>
            </>
          );

          const cardStyle = {
            position: "relative" as const,
            display: "flex" as const,
            flexDirection: "column" as const,
            textDecoration: "none",
            color: "var(--vault-paper)",
            paddingTop: 18,
            paddingBottom: 24,
            borderTop: `1px solid ${
              isCurrent ? "var(--vault-ember)" : "var(--vault-rule)"
            }`,
            cursor: isLink ? "pointer" : "default",
          };

          return isLink ? (
            <a
              key={s.key}
              href={s.url!}
              target="_blank"
              rel="noopener noreferrer"
              style={cardStyle}
            >
              {cardInner}
            </a>
          ) : (
            <div key={s.key} style={cardStyle}>
              {cardInner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
