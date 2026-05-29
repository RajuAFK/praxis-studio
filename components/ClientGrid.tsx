"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import type { ClientLogo, Industry } from "@/lib/clients";

/**
 * Client-side filter + logo grid.
 * Filter state stays here; the server renders the full data upfront so the
 * grid is interactive but seeded with content for SEO.
 */
export function ClientGrid({
  industries,
  total,
}: {
  industries: Industry[];
  total: number;
}) {
  const [active, setActive] = useState<string>("all");

  const filters = useMemo(
    () => [
      { slug: "all", label: "All", count: total },
      ...industries.map((i) => ({
        slug: i.slug,
        label: i.label,
        count: i.clients.length,
      })),
    ],
    [industries, total]
  );

  const visible: ClientLogo[] = useMemo(() => {
    if (active === "all") return industries.flatMap((i) => i.clients);
    const hit = industries.find((i) => i.slug === active);
    return hit ? hit.clients : [];
  }, [active, industries]);

  return (
    <>
      {/* Filter chips */}
      <div
        className="font-mono"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px 18px",
          fontSize: 11,
          letterSpacing: "0.22em",
          color: "var(--vault-paper-dim)",
          borderTop: "1px solid var(--vault-rule)",
          borderBottom: "1px solid var(--vault-rule)",
          padding: "18px 0",
          marginBottom: 56,
        }}
      >
        {filters.map((f) => {
          const isActive = f.slug === active;
          return (
            <button
              key={f.slug}
              type="button"
              onClick={() => setActive(f.slug)}
              className={isActive ? "" : "vault-link"}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: isActive
                  ? "var(--vault-ember)"
                  : "var(--vault-paper-dim)",
                fontFamily: "inherit",
                fontSize: "inherit",
                letterSpacing: "inherit",
                textTransform: "uppercase",
              }}
            >
              {f.label} · {f.count}
            </button>
          );
        })}
      </div>

      {/* Logo grid — fixed height (~3 rows) with internal scroll */}
      {visible.length === 0 ? (
        <p
          style={{
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--vault-paper-dim)",
          }}
        >
          No clients in this category yet.
        </p>
      ) : (
        <div
          className="client-grid-scroll"
          style={{
            maxHeight: "clamp(560px, 64vh, 720px)",
            overflowY: "auto",
            paddingRight: 12,
            // Subtle fade at the bottom hints at more content
            maskImage:
              "linear-gradient(to bottom, #000 0, #000 calc(100% - 32px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0, #000 calc(100% - 32px), transparent 100%)",
          }}
        >
          <div
            className="grid gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              paddingBottom: 32,
            }}
          >
            {visible.map((c) => (
              <ClientCell key={`${c.industry}-${c.src}`} client={c} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ClientCell({ client }: { client: ClientLogo }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
      title={client.name}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: "rgba(244,236,225,0.04)",
          padding: 16,
        }}
      >
        <Image
          src={client.src}
          alt={client.name}
          fill
          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 18vw, 140px"
          style={{
            objectFit: "contain",
            // Most logos are darks-on-light — invert + soften so they sit on
            // the studio's near-black canvas without losing brand colour.
            filter: "invert(1) brightness(0.95) contrast(1.05)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "var(--vault-paper-dim)",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {client.name.toUpperCase()}
      </div>
    </div>
  );
}
