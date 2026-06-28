import { Accent } from "./Accent";
import { ContactForm } from "./ContactForm";

const EMAILS = ["praxivision.info@gmail.com", "praxisstudio@gmail.com"];

const ADDRESS = [
  "1-11-182, G1, Kamala Palace",
  "Begumpet",
  "Hyderabad — 500016",
  "India",
];

const INDEX = [
  { label: "Work",         href: "/" },
  { label: "Archive",      href: "/archive" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Studio",       href: "/studio" },
  { label: "Contact",      href: "#contact" },
];

/**
 * Contact + footer combined.
 * Top half: contact form (mailto submission).
 * Bottom half: emails, address, site index, copyright strip.
 */
export function ContactFooter() {
  return (
    <footer id="contact">
      {/* Contact form */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-12 md:gap-20 grid-cols-1 md:[grid-template-columns:5fr_7fr] items-start">
          <div>
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "var(--vault-ember)",
                marginBottom: 24,
              }}
            >
              06 — CONTACT
            </div>
            <h2 className="h-display-m" style={{ margin: 0 }}>
              Begin a<br />
              <Accent text="commission." />
            </h2>
            <p
              style={{
                marginTop: 28,
                maxWidth: 480,
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--vault-paper-dim)",
              }}
            >
              A site visit, a conversation, and a printed checklist. Tell us
              what the photograph is for and we will tell you what it needs to
              be.
            </p>

            {/* Direct emails — fallback for anyone who prefers not to use the form */}
            <div
              className="font-mono"
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--vault-rule)",
                fontSize: 11,
                letterSpacing: "0.22em",
                color: "var(--vault-paper-dim)",
              }}
            >
              <div style={{ marginBottom: 12 }}>OR EMAIL DIRECT</div>
              {EMAILS.map((e) => (
                <div key={e} style={{ marginBottom: 6 }}>
                  <a
                    href={`mailto:${e}`}
                    className="vault-link"
                    style={{ color: "var(--vault-paper)" }}
                  >
                    {e}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <ContactForm primaryEmail={EMAILS[0]} />
        </div>
      </section>

      {/* Address + index strip */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 80,
          paddingBottom: 60,
          borderTop: "1px solid var(--vault-rule)",
        }}
      >
        <div className="grid gap-12 grid-cols-1 md:grid-cols-3">
          <FooterCol heading="STUDIO">
            {ADDRESS.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </FooterCol>

          <FooterCol heading="OFFICE">
            <div>Hyderabad, India</div>
            <div style={{ marginTop: 8, color: "var(--vault-paper-dim)" }}>
              By appointment only.
            </div>
          </FooterCol>

          <FooterCol heading="INDEX">
            {INDEX.map((l) => (
              <div key={l.label} style={{ marginBottom: 4 }}>
                <a
                  href={l.href}
                  className="vault-link"
                  style={{ color: "var(--vault-paper)" }}
                >
                  {l.label}
                </a>
              </div>
            ))}
          </FooterCol>
        </div>

        {/* Bottom strip */}
        <div
          className="font-mono"
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid var(--vault-rule)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--vault-paper-dim)",
          }}
        >
          <span>© PRAXIS STUDIO · 1992 — 2026</span>
          <span>
            A DEPARTMENT OF{" "}
            <span style={{ color: "var(--vault-paper)" }}>
              PRAXIVISION PRIVATE LIMITED
            </span>
          </span>
          <span>HYDERABAD · INDIA</span>
        </div>
      </section>
    </footer>
  );
}

function FooterCol({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-ember)",
          marginBottom: 18,
        }}
      >
        {heading}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--vault-paper)" }}>
        {children}
      </div>
    </div>
  );
}
