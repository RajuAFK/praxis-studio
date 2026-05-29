import Link from "next/link";
import Image from "next/image";
import { Accent } from "@/components/Accent";
import { ContactFooter } from "@/components/ContactFooter";
import { VaultNav } from "@/components/VaultNav";
import { CATEGORIES } from "@/lib/plates";
import {
  getCategoryCounts,
  getWorksByCategory,
  type CategoryKey,
} from "@/lib/portfolio";

export const metadata = {
  title: "Archive — Praxis Studio",
};

export default function ArchiveLandingPage() {
  const counts = getCategoryCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <main style={{ position: "relative" }}>
      <VaultNav active="Archive" />

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
            ARCHIVE · FOUR INSTRUMENTS · {total} WORKS
          </div>
          <h1 className="h-display-xl md:order-1" style={{ margin: 0 }}>
            From the
            <br />
            <Accent text="archive." />
          </h1>
        </div>
      </section>

      {/* 4 category tiles */}
      <section className="vault-pad" style={{ paddingBottom: 144 }}>
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const works = getWorksByCategory(cat.key as CategoryKey);
            // Category-level cover overrides — used when a category's works
            // either have no covers or when we want a specific representative
            // image for the landing tile.
            const CATEGORY_COVER_OVERRIDES: Partial<Record<CategoryKey, string>> = {
              "3d": "/category-covers/3d.png",
            };
            const overrideCover = CATEGORY_COVER_OVERRIDES[cat.key as CategoryKey];
            const cover = overrideCover
              ? { cover: overrideCover }
              : works.find((w) => w.cover);
            return (
              <Link
                key={cat.key}
                href={`/archive/${cat.key}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
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
                  <span>{cat.short}</span>
                  <span style={{ color: "var(--vault-paper-dim)" }}>
                    {counts[cat.key as CategoryKey]}{" "}
                    {counts[cat.key as CategoryKey] === 1 ? "WORK" : "WORKS"}
                  </span>
                </div>

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
                  {cover && cover.cover ? (
                    <Image
                      src={cover.cover}
                      alt={`${cat.title} cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="font-mono"
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--vault-paper-dim)",
                        fontSize: 10,
                        letterSpacing: "0.32em",
                        background:
                          "repeating-linear-gradient(135deg, #0c0c0c 0 24px, #111 24px 48px)",
                      }}
                    >
                      {cat.short}
                    </div>
                  )}
                  <span className="vault-plate-reticle" aria-hidden />
                  <span className="vault-plate-line" aria-hidden />
                  <div className="vault-plate-meta">
                    <span>OPEN {cat.title.toUpperCase()} →</span>
                  </div>
                </div>

                <div
                  className="vault-row-title"
                  style={{
                    marginTop: 22,
                    fontWeight: 300,
                    fontSize: "clamp(34px, 4.4vw, 56px)",
                    letterSpacing: "-0.025em",
                    lineHeight: 1,
                  }}
                >
                  {(() => {
                    const words = cat.title.split(" ");
                    const head = words.slice(0, -1).join(" ");
                    const tail = words.slice(-1)[0];
                    return (
                      <>
                        {head}{" "}
                        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                          {tail}.
                        </em>
                      </>
                    );
                  })()}
                </div>

                <p
                  style={{
                    marginTop: 14,
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: "var(--vault-paper-dim)",
                    maxWidth: 540,
                  }}
                >
                  {cat.body}
                </p>

                <div
                  className="font-mono"
                  style={{
                    marginTop: 24,
                    paddingTop: 18,
                    borderTop: "1px solid var(--vault-rule)",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                  }}
                >
                  <span style={{ color: "var(--vault-paper)" }}>
                    OPEN ARCHIVE
                  </span>
                  <span style={{ color: "var(--vault-ember)" }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <ContactFooter />
    </main>
  );
}
