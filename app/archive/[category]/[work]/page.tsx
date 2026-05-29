import Link from "next/link";
import { notFound } from "next/navigation";
import { Accent } from "@/components/Accent";
import { ContactFooter } from "@/components/ContactFooter";
import { ViewerSlot } from "@/components/ViewerSlot";
import { VaultBrackets } from "@/components/VaultBrackets";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { VaultNav } from "@/components/VaultNav";
import { getCategory } from "@/lib/plates";
import {
  getAllWorks,
  getWork,
  getWorksByCategory,
  type CategoryKey,
} from "@/lib/portfolio";

export function generateStaticParams() {
  return getAllWorks().map((w) => ({ category: w.category, work: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; work: string }>;
}) {
  const { category, work } = await params;
  const w = getWork(category as CategoryKey, work);
  if (!w) return { title: "Work — Praxis Studio" };
  return { title: `${w.title} — Praxis Studio` };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ category: string; work: string }>;
}) {
  const { category, work } = await params;
  const cat = getCategory(category);
  const w = getWork(category as CategoryKey, work);
  if (!cat || !w) notFound();

  // Find next work in the same category
  const siblings = getWorksByCategory(category as CategoryKey);
  const idx = siblings.findIndex((s) => s.id === w.id);
  const next = siblings[(idx + 1) % siblings.length];

  return (
    <main style={{ position: "relative" }}>
      <VaultNav active="Archive" />

      {/* Header */}
      <section
        className="vault-pad"
        style={{ paddingTop: 144, paddingBottom: 48 }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            color: "var(--vault-ember)",
            marginBottom: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <Link
            href={`/archive/${cat.key}`}
            className="vault-link"
            style={{ color: "var(--vault-paper)" }}
          >
            ← {cat.short.split(" · ")[1] ?? cat.title.toUpperCase()}
          </Link>
          {w.group && <span>{w.group.toUpperCase()}</span>}
          <span>
            {w.kind === "gallery"
              ? `${w.imageCount} FRAMES`
              : w.kind === "iframe"
              ? "INTERACTIVE"
              : "3D MODEL"}
          </span>
        </div>

        <h1 className="h-display-xl" style={{ margin: 0, maxWidth: 1200 }}>
          {(() => {
            const words = w.title.split(" ");
            const head = words.slice(0, -1).join(" ");
            const tail = words.slice(-1)[0];
            return (
              <>
                {head}
                {head && <br />}
                <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                  {tail}.
                </em>
              </>
            );
          })()}
        </h1>
      </section>

      {/* Body — depends on kind */}
      {w.kind === "iframe" && w.iframeSrc && (
        <IframeBody src={w.iframeSrc} title={w.title} poster={w.cover} />
      )}
      {w.kind === "model" && w.modelSrc && (
        <ModelBody src={w.modelSrc} title={w.title} poster={w.cover} />
      )}
      {w.kind === "gallery" && w.gallery && (
        <GalleryBody images={w.gallery} title={w.title} />
      )}

      {/* Next work */}
      {next && next.id !== w.id && (
        <section className="vault-pad" style={{ paddingTop: 96, paddingBottom: 144 }}>
          <div
            className="grid gap-8 md:gap-16 grid-cols-1 md:[grid-template-columns:1fr_2fr] md:items-end"
            style={{
              borderTop: "1px solid var(--vault-rule)",
              paddingTop: 56,
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                color: "var(--vault-paper-dim)",
              }}
            >
              NEXT IN {cat.title.toUpperCase()} →
            </div>
            <Link
              href={`/archive/${cat.key}/${next.id}`}
              className="vault-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                textDecoration: "none",
                color: "var(--vault-paper)",
                padding: "12px 0",
              }}
            >
              <div className="vault-row-title">
                <div
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(34px, 5.4vw, 64px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {(() => {
                    const words = next.title.split(" ");
                    const head = words.slice(0, -1).join(" ");
                    const tail = words.slice(-1)[0];
                    return (
                      <>
                        {head ? head + " " : ""}
                        <em style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
                          {tail}.
                        </em>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <ContactFooter />
    </main>
  );
}

/* ---------- Renderers ------------------------------------------------- */

function IframeBody({
  src,
  title,
  poster,
}: {
  src: string;
  title: string;
  poster?: string;
}) {
  return (
    <section className="vault-pad" style={{ paddingBottom: 80 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          border: "1px solid var(--vault-rule)",
          background: "#000",
        }}
      >
        <ViewerSlot kind="iframe" src={src} title={title} eager poster={poster} />
        <VaultBrackets />
      </div>
      <div
        className="font-mono"
        style={{
          marginTop: 16,
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
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="vault-link"
          style={{ color: "var(--vault-paper)" }}
        >
          OPEN IN NEW TAB ↗
        </a>
      </div>
    </section>
  );
}

function ModelBody({
  src,
  title,
  poster,
}: {
  src: string;
  title: string;
  poster?: string;
}) {
  return (
    <section className="vault-pad" style={{ paddingBottom: 80 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          border: "1px solid var(--vault-rule)",
          background: "#000",
        }}
      >
        <ViewerSlot kind="model" src={src} title={title} eager poster={poster} />
        <VaultBrackets />
      </div>
      <div
        className="font-mono"
        style={{
          marginTop: 16,
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
          ● DRAG TO ROTATE · SCROLL TO ZOOM
        </span>
        <span>GLB · WEB-DELIVERABLE</span>
      </div>
    </section>
  );
}

function GalleryBody({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) {
    return (
      <section className="vault-pad" style={{ paddingBottom: 80 }}>
        <p
          style={{
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--vault-paper-dim)",
          }}
        >
          No images on file yet.
        </p>
      </section>
    );
  }

  return (
    <section className="vault-pad" style={{ paddingBottom: 96 }}>
      <GalleryLightbox images={images} title={title} />
    </section>
  );
}
