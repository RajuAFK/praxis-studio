import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Accent } from "@/components/Accent";
import { ContactFooter } from "@/components/ContactFooter";
import { VaultNav } from "@/components/VaultNav";
import { CATEGORIES, getCategory } from "@/lib/plates";
import {
  getCategoryCounts,
  getWorksByCategory,
  type CategoryKey,
} from "@/lib/portfolio";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Archive — Praxis Studio" };
  return { title: `${cat.title} — Archive · Praxis Studio` };
}

export default async function CategoryArchivePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const works = getWorksByCategory(cat.key as CategoryKey);
  const counts = getCategoryCounts();
  const others = CATEGORIES.filter((c) => c.key !== cat.key);

  return (
    <main style={{ position: "relative" }}>
      <VaultNav active="Archive" />

      {/* Header */}
      <section
        className="vault-pad"
        style={{ paddingTop: 144, paddingBottom: 56 }}
      >
        <div className="grid gap-8 md:gap-16 grid-cols-1 md:[grid-template-columns:1fr_2fr] md:items-end">
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "var(--vault-ember)",
            }}
          >
            {cat.short} · {works.length} {works.length === 1 ? "WORK" : "WORKS"}
          </div>
          <h1 className="h-display-xl" style={{ margin: 0 }}>
            {(() => {
              const words = cat.title.split(" ");
              const head = words.slice(0, -1).join(" ");
              const tail = words.slice(-1)[0];
              return (
                <>
                  {head}
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                    {tail}.
                  </em>
                </>
              );
            })()}
          </h1>
        </div>

        <p
          style={{
            marginTop: 32,
            maxWidth: 720,
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--vault-paper-dim)",
          }}
        >
          {cat.body}
        </p>

        {/* Category switcher */}
        <div
          className="font-mono"
          style={{
            marginTop: 56,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--vault-paper-dim)",
            borderTop: "1px solid var(--vault-rule)",
            borderBottom: "1px solid var(--vault-rule)",
            padding: "18px 0",
          }}
        >
          <Link href="/archive" className="vault-link" style={{ color: "var(--vault-paper)" }}>
            ← ALL CATEGORIES
          </Link>
          {others.map((o) => (
            <Link
              key={o.key}
              href={`/archive/${o.key}`}
              className="vault-link"
              style={{ color: "var(--vault-paper-dim)" }}
            >
              {o.short.split(" · ")[1] ?? o.title.toUpperCase()}
              <span style={{ marginLeft: 8, color: "var(--vault-paper-dim)" }}>
                · {counts[o.key as CategoryKey]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tile grid of works */}
      <section className="vault-pad" style={{ paddingBottom: 144 }}>
        {works.length === 0 ? (
          <p
            style={{
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--vault-paper-dim)",
              maxWidth: 520,
            }}
          >
            No works published in this discipline yet.
          </p>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w, i) => (
              <Link
                key={w.id}
                href={`/archive/${cat.key}/${w.id}`}
                className="vault-plate group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "var(--vault-paper)",
                  aspectRatio: "auto",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    background: "#0a0a0a",
                    overflow: "hidden",
                  }}
                >
                  {w.cover ? (
                    <Image
                      src={w.cover}
                      alt={w.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      priority={i < 6}
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
                      {w.kind.toUpperCase()}
                    </div>
                  )}
                  <span className="vault-plate-reticle" aria-hidden />
                  <span className="vault-plate-line" aria-hidden />
                  <div className="vault-plate-meta">
                    <span>OPEN →</span>
                    {w.imageCount > 0 && (
                      <span style={{ color: "var(--vault-ember)" }}>
                        {w.imageCount} FRAMES
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="font-mono"
                  style={{
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                  }}
                >
                  <span style={{ color: "var(--vault-ember)" }}>
                    {w.group ?? cat.short.split(" · ")[1] ?? cat.title.toUpperCase()}
                  </span>
                  <span style={{ color: "var(--vault-paper-dim)" }}>
                    {w.kind === "gallery"
                      ? `${w.imageCount} FRAMES`
                      : w.kind === "iframe"
                      ? "INTERACTIVE"
                      : "3D MODEL"}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontWeight: 300,
                    fontSize: 22,
                    letterSpacing: "-0.015em",
                    lineHeight: 1.1,
                  }}
                >
                  {(() => {
                    const words = w.title.split(" ");
                    const head = words.slice(0, -1).join(" ");
                    const tail = words.slice(-1)[0];
                    return (
                      <>
                        {head ? head + " " : ""}
                        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                          {tail}
                        </em>
                      </>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <ContactFooter />
    </main>
  );
}
