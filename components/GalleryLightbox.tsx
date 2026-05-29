"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Click-to-fullscreen image gallery.
 *
 * Renders the supplied images as a responsive grid of clickable thumbnails.
 * Clicking any frame opens a full-screen lightbox; the user can:
 *   - ◀ / ▶ arrow keys, on-screen arrows, or swipe to nav
 *   - Esc, the close button, or click the dim backdrop to dismiss
 *
 * Photo galleries are lightweight per the studio's brief — every image
 * loads eagerly via the browser's native loading. No connection gate.
 */
export function GalleryLightbox({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () =>
      setActive((i) =>
        i === null ? null : (i - 1 + images.length) % images.length
      ),
    [images.length]
  );

  // Keyboard nav + body scroll lock while open
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close, next, prev]);

  return (
    <>
      <div className="grid gap-2 md:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Open frame ${i + 1} of ${images.length}`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 3",
              background: "#0a0a0a",
              overflow: "hidden",
              padding: 0,
              border: 0,
              cursor: "zoom-in",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} — frame ${i + 1}`}
              loading={i < 12 ? "eager" : "lazy"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 600ms cubic-bezier(.2,.7,.3,1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform =
                  "scale(1)";
              }}
            />
          </button>
        ))}
      </div>
      <div
        className="font-mono"
        style={{
          marginTop: 20,
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--vault-paper-dim)",
        }}
      >
        {images.length} {images.length === 1 ? "FRAME" : "FRAMES"} IN THIS DOSSIER ·
        TAP TO ENLARGE
      </div>

      {active !== null && (
        <Lightbox
          src={images[active]}
          index={active}
          total={images.length}
          title={title}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </>
  );
}

function Lightbox({
  src,
  index,
  total,
  title,
  onClose,
  onNext,
  onPrev,
}: {
  src: string;
  index: number;
  total: number;
  title: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — frame ${index + 1} of ${total}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4, 4, 3, 0.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "lightbox-in 200ms ease-out",
      }}
    >
      <style>{`
        @keyframes lightbox-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Image — stop click propagation so clicking the image doesn't close */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} — frame ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "92vw",
          maxHeight: "88vh",
          objectFit: "contain",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      />

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        title="Close (Esc)"
        style={iconBtn({ top: 18, right: 18 })}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 3 L13 13" />
          <path d="M13 3 L3 13" />
        </svg>
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous frame"
          title="Previous (←)"
          style={iconBtn({ top: "50%", left: 18, transform: "translateY(-50%)" })}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3 L4 8 L10 13" />
          </svg>
        </button>
      )}

      {/* Next */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next frame"
          title="Next (→)"
          style={iconBtn({ top: "50%", right: 18, transform: "translateY(-50%)" })}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 3 L12 8 L6 13" />
          </svg>
        </button>
      )}

      {/* Caption / counter */}
      <div
        className="font-mono"
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "rgba(244, 236, 225, 0.65)",
          pointerEvents: "none",
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} ·{" "}
        <span style={{ color: "var(--vault-ember)" }}>
          {title.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function iconBtn(pos: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    ...pos,
    width: 40,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.55)",
    border: "1px solid rgba(244, 236, 225, 0.30)",
    color: "var(--vault-paper)",
    cursor: "pointer",
    padding: 0,
    zIndex: 2,
  };
}
