"use client";

import { useState, type CSSProperties } from "react";
import { FEATURED, type Featured } from "@/lib/plates";
import { PlateImage } from "./PlateImage";
import { VaultPlate } from "./VaultPlate";

/**
 * Home hero + plate switcher.
 *
 * Hero is a true 100vh full-bleed photograph with the headline + intro
 * anchored to the bottom-left. The 4 thumbnails sit in a separate
 * `<section>` below the fold — scroll down to switch plates. State stays
 * inside this component so the click handler still drives the hero crossfade.
 */
export function HeroSwitcher() {
  const [active, setActive] = useState(0);
  const current = FEATURED[active];
  const others = FEATURED.map((p, i) => ({ ...p, _idx: i })).filter(
    (_, i) => i !== active
  );

  return (
    <>
      {/* HERO — 100vh, no overlays except the bottom-left composition */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: 560,
          overflow: "hidden",
        }}
      >
        {/* Stacked images — crossfade */}
        {FEATURED.map((p, i) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === active ? 1 : 0,
              transition: "opacity 1000ms cubic-bezier(.2,.7,.3,1)",
            }}
          >
            <PlateImage
              id={p.id}
              alt={`${p.title} — ${p.client}`}
              position={p.position}
              priority={i === 0}
              sizes="100vw"
            />
            {/* vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(85% 85% at 50% 45%, transparent 0%, rgba(0,0,0,0.6) 100%)",
              }}
            />
            {/* bottom darken — gives the headline a legible plate */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(rgba(0,0,0,0.45) 0%, transparent 22%, transparent 50%, rgba(0,0,0,0.92) 100%)",
              }}
            />
          </div>
        ))}

        {/* Headline composition — position varies per plate via current.textPosition */}
        <HeroHeadline plate={current} />

        {/* Quiet scroll cue — sits opposite the headline so they never collide */}
        <div
          className="font-mono"
          style={{
            position: "absolute",
            bottom: "clamp(24px, 4vh, 40px)",
            zIndex: 10,
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--vault-paper-dim)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            ...(current.textPosition === "right-bottom"
              ? { left: "clamp(20px, 4vw, 56px)" }
              : { right: "clamp(20px, 4vw, 56px)" }),
          }}
        >
          <span style={{ color: "var(--vault-ember)" }}>↓</span>
          <span>SCROLL TO SELECT A PLATE</span>
        </div>
      </section>

      {/* SWITCHER — below the fold. Counter + 4 thumbnails. */}
      <section
        className="vault-pad"
        style={{
          paddingTop: 64,
          paddingBottom: 80,
          background: "var(--vault-bg)",
        }}
      >
        <div
          className="font-mono"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            paddingBottom: 24,
            borderBottom: "1px solid var(--vault-rule)",
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--vault-paper-dim)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display), serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "var(--vault-paper)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: "var(--vault-ember)" }}>0{active + 1}</span>
            <span style={{ color: "var(--vault-paper-dim)" }}> / 05</span>
          </div>
          <span className="hidden sm:inline">SELECT A PLATE</span>
          <span style={{ color: "var(--vault-ember)", marginLeft: "auto" }}>
            ● {current.tag}
          </span>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mt-8">
          {others.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p._idx)}
              style={{
                display: "block",
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: 0,
                color: "var(--vault-paper)",
                cursor: "pointer",
              }}
              aria-label={`Show plate ${p.no} — ${p.title}`}
            >
              <VaultPlate
                plateId={p.id}
                plateNo={p.no}
                caption="REVEAL →"
                alt={`${p.title} — ${p.client}`}
                position={p.position}
                style={{ aspectRatio: "4 / 3", width: "100%" }}
                sizes="(max-width: 768px) 50vw, 22vw"
              />
              <div
                className="font-mono"
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                }}
              >
                <span style={{ color: "var(--vault-ember)" }}>{p.tag}</span>
                <span style={{ color: "var(--vault-paper-dim)" }}>
                  PL. {p.no}
                </span>
              </div>
              <div
                className="hidden sm:block"
                style={{
                  marginTop: 6,
                  fontWeight: 300,
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                {p.headHead.replace(/[,]$/, "")}{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--vault-ember)",
                  }}
                >
                  {p.headTail.replace(/\.$/, "")}
                </em>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * Hero headline — small, no intro paragraph.
 * The container position + text alignment shift based on plate.textPosition
 * so the headline can sit beside the subject without covering it.
 */
function HeroHeadline({ plate }: { plate: Featured }) {
  const pos = plate.textPosition ?? "left-bottom";

  // Container — anchored to a different corner per position.
  const containerStyle: CSSProperties = {
    position: "absolute",
    zIndex: 10,
    maxWidth: "min(680px, 90vw)",
  };
  if (pos === "left-bottom") {
    Object.assign(containerStyle, {
      left: "clamp(20px, 4vw, 80px)",
      bottom: "clamp(60px, 10vh, 120px)",
      textAlign: "left" as const,
    });
  } else if (pos === "right-bottom") {
    Object.assign(containerStyle, {
      right: "clamp(20px, 4vw, 80px)",
      bottom: "clamp(60px, 10vh, 120px)",
      textAlign: "right" as const,
    });
  } else {
    // top-left — clear of the nav (nav sits ~80px down from top)
    Object.assign(containerStyle, {
      left: "clamp(20px, 4vw, 80px)",
      top: "clamp(120px, 18vh, 200px)",
      textAlign: "left" as const,
    });
  }

  return (
    <div style={containerStyle}>
      <h1
        key={"head-" + plate.id}
        className="vault-reveal"
        style={{
          margin: 0,
          color: "var(--vault-paper)",
          fontWeight: 300,
          // Smaller than before — was clamp(48px, 10vw, 148px)
          fontSize: "clamp(40px, 6.5vw, 96px)",
          lineHeight: 0.95,
          letterSpacing: "-0.035em",
        }}
      >
        {plate.headHead}
        <br />
        <em
          style={{
            fontStyle: "italic",
            color: "var(--vault-ember)",
            fontWeight: "inherit",
          }}
        >
          {plate.headTail}
        </em>
      </h1>
    </div>
  );
}
