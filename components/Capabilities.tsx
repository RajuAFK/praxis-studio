import Link from "next/link";
import { Accent } from "./Accent";
import { VaultBrackets } from "./VaultBrackets";
import { ViewerSlot } from "./ViewerSlot";
import { CATEGORIES } from "@/lib/plates";

/**
 * Capabilities — one block per discipline, each with a single live iframe
 * (R2-hosted viewer) and a CTA into its category archive.
 *
 * Sequence: Photography → VRs → Gigapixel → 3D Models.
 */
export function Capabilities() {
  return (
    <section
      className="vault-pad"
      style={{
        paddingTop: 96,
        paddingBottom: 120,
        borderTop: "1px solid var(--vault-rule)",
      }}
    >
      {/* Header */}
      <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] md:items-baseline mb-16 md:mb-24">
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            color: "var(--vault-ember)",
          }}
        >
          02 — CAPABILITIES
        </div>
        <div>
          <h2 className="h-display-m" style={{ margin: 0 }}>
            Four instruments,
            <br />
            <Accent text="one studio." />
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
            Photography is the spine. Each of the other three is an answer to a
            question a client could not previously ask.
          </p>
        </div>
      </div>

      {/* The 4 capability blocks */}
      <div className="flex flex-col gap-20 md:gap-28">
        {CATEGORIES.map((cat) => (
          <CapabilityBlock key={cat.key} cat={cat} />
        ))}
      </div>
    </section>
  );
}

function CapabilityBlock({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  return (
    <div
      className="grid gap-10 md:gap-16 grid-cols-1 md:[grid-template-columns:7fr_5fr] items-start"
      style={{
        borderTop: "1px solid var(--vault-ember)",
        paddingTop: 40,
      }}
    >
      {/* Viewer (iframe) — left on desktop, top on mobile */}
      <div>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 10",
            border: "1px solid var(--vault-rule)",
            background: "#000",
          }}
        >
          <ViewerSlot
            kind={cat.demoKind}
            src={cat.demoSrc}
            title={`${cat.title} demo`}
            objectPosition={cat.demoObjectPosition}
            poster={cat.demoPoster}
            weightLabel={cat.demoWeight}
          />
          <VaultBrackets />
        </div>
        <div
          className="font-mono"
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 8,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--vault-paper-dim)",
          }}
        >
          <span style={{ color: "var(--vault-ember)" }}>
            ● LIVE · INTERACT WITH THE FRAME
          </span>
          <span>SPECIMEN · INSTRUMENT {cat.numeral}</span>
        </div>
      </div>

      {/* Copy + CTA */}
      <div>
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--vault-ember)",
          }}
        >
          {cat.short}
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
          {(() => {
            const words = cat.title.split(" ");
            const tail = words[words.length - 1];
            const head = words.slice(0, -1).join(" ");
            return (
              <>
                {head}{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--vault-ember)",
                  }}
                >
                  {tail}.
                </em>
              </>
            );
          })()}
        </h3>
        <p
          style={{
            marginTop: 20,
            maxWidth: 480,
            fontSize: 17,
            lineHeight: 1.65,
            color: "var(--vault-paper-dim)",
          }}
        >
          {cat.body}
        </p>

        <Link
          href={`/archive/${cat.key}`}
          className="vault-link font-mono inline-flex items-center mt-8"
          style={{
            gap: 10,
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--vault-paper)",
            paddingBottom: 6,
            textDecoration: "none",
          }}
        >
          OPEN {cat.short.split(" · ")[1] || cat.title.toUpperCase()} ARCHIVE
          <span style={{ color: "var(--vault-ember)" }}>→</span>
        </Link>
      </div>
    </div>
  );
}
