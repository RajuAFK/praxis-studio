import { Accent } from "./Accent";
import { ClientGrid } from "./ClientGrid";
import { getClientCount, getIndustries } from "@/lib/clients";

/**
 * Client roster — server component that reads the public/clients tree and
 * hands the data to a small client component for the filter interaction.
 */
export function ClientList() {
  const industries = getIndustries().filter((i) => i.clients.length > 0);
  const total = getClientCount();

  return (
    <section
      id="clients"
      className="vault-pad"
      style={{
        paddingTop: 96,
        paddingBottom: 120,
        borderTop: "1px solid var(--vault-rule)",
      }}
    >
      {/* Section header */}
      <div className="grid gap-10 md:gap-24 grid-cols-1 md:[grid-template-columns:1fr_2fr] md:items-baseline mb-16 md:mb-20">
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            color: "var(--vault-ember)",
          }}
        >
          05 — CLIENTS · {total} INSTITUTIONS
        </div>
        <div>
          <h2 className="h-display-m" style={{ margin: 0 }}>
            Trusted across
            <br />
            <Accent text="industries." />
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
            Three decades of campaigns for foundries, refineries, hospitals,
            universities, and the institutions that built modern India. A short
            list, by industry.
          </p>
        </div>
      </div>

      {/* Filter + grid */}
      <ClientGrid industries={industries} total={total} />
    </section>
  );
}
