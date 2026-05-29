"use client";

import { useEffect, useRef, useState } from "react";
import { viewerUrl, isPlaceholder } from "@/lib/r2";
import { useMediaPreference } from "./MediaPreference";

export type ViewerKind = "iframe" | "image" | "model";

const R2_BASE = "https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev";
const R2_MODEL_VIEWER = `${R2_BASE}/portfolio/viewers/model.html`;

const SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms";
const ALLOW_MUTED =
  "fullscreen; accelerometer; gyroscope; xr-spatial-tracking";
const ALLOW_UNMUTED =
  "fullscreen; accelerometer; gyroscope; xr-spatial-tracking; autoplay";

/**
 * Live capability viewer.
 *
 * Iframe kinds (VR / gigapan / model wrapper) are treated as "heavy media":
 *   - On a wifi preference, they load on mount.
 *   - On mobile preference (or before the gate is answered), they render a
 *     placeholder card with a "Load this content" CTA. The user opts-in per
 *     frame. After load, behaviour is identical to wifi mode.
 *
 * Audio policy: iframe sandboxed + autoplay denied by default. Custom
 * fullscreen button fullscreens the container; while fullscreen, an
 * UNMUTE AUDIO pill appears. Exiting fullscreen re-mutes.
 */
export function ViewerSlot({
  id,
  kind,
  src,
  title,
  className,
  eager,
  objectPosition,
  poster,
  weightLabel,
}: {
  id?: string;
  kind?: ViewerKind;
  src?: string;
  title: string;
  className?: string;
  eager?: boolean;
  objectPosition?: string;
  /** Optional preview image for the load-gate placeholder. */
  poster?: string;
  /** Short label describing weight/format ("360° tour · pano2vr"). */
  weightLabel?: string;
}) {
  if (kind && src) {
    if (kind === "image") {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={src}
          alt={title}
          loading={eager ? "eager" : "lazy"}
          className={className}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: objectPosition ?? "50% 50%",
            background: "#000",
          }}
        />
      );
    }

    const iframeSrc =
      kind === "model"
        ? `${R2_MODEL_VIEWER}?src=${encodeURIComponent(src)}`
        : src;

    const kindLabel =
      kind === "model"
        ? "3D MODEL"
        : "INTERACTIVE FRAME";

    return (
      <InteractiveFrame
        src={iframeSrc}
        title={title}
        eager={eager}
        className={className}
        poster={poster}
        kindLabel={kindLabel}
        weightLabel={weightLabel}
      />
    );
  }

  if (isPlaceholder() || !id) {
    return (
      <div
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background:
            "radial-gradient(circle at 50% 50%, #0e0e0e 0%, #000 70%)",
          color: "var(--vault-paper-dim)",
          fontFamily: "var(--font-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.28em",
          textAlign: "center",
          padding: 16,
        }}
      >
        <span style={{ color: "var(--vault-ember)" }}>
          ● VIEWER · {(id ?? "unset").toUpperCase()}
        </span>
        <span>IFRAME → {`{R2}/viewers/${id ?? "—"}/`}</span>
      </div>
    );
  }

  return (
    <InteractiveFrame
      src={viewerUrl(id)}
      title={title}
      eager={eager}
      className={className}
      poster={poster}
      kindLabel="INTERACTIVE FRAME"
      weightLabel={weightLabel}
    />
  );
}

function InteractiveFrame({
  src,
  title,
  eager,
  className,
  poster,
  kindLabel,
  weightLabel,
}: {
  src: string;
  title: string;
  eager?: boolean;
  className?: string;
  poster?: string;
  kindLabel: string;
  weightLabel?: string;
}) {
  const { ready } = useMediaPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const [unmuted, setUnmuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [manualLoad, setManualLoad] = useState(false);

  // Thumbnail-first universally — only mount the iframe after the user taps
  // "Load this content" OR requests fullscreen on the frame.
  const shouldLoadIframe = ready && manualLoad;

  useEffect(() => {
    const onChange = () => {
      const fs = document.fullscreenElement === containerRef.current;
      setIsFullscreen(fs);
      if (!fs) setUnmuted(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    } else {
      // Mount the iframe on the same gesture that requests fullscreen, so
      // users who go straight to fullscreen never see the placeholder.
      if (!manualLoad) setManualLoad(true);
      await containerRef.current?.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
      }}
    >
      {shouldLoadIframe ? (
        <iframe
          key={unmuted ? "live" : "muted"}
          src={src}
          title={title}
          loading={eager ? "eager" : "lazy"}
          allowFullScreen
          allow={unmuted ? ALLOW_UNMUTED : ALLOW_MUTED}
          sandbox={unmuted ? undefined : SANDBOX}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      ) : (
        <LoadGate
          poster={poster}
          title={title}
          kindLabel={kindLabel}
          weightLabel={weightLabel}
          ready={ready}
          onLoad={() => setManualLoad(true)}
        />
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 34,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: isFullscreen
            ? "rgba(217, 106, 42, 0.85)"
            : "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(244, 236, 225, 0.28)",
          color: "var(--vault-paper)",
          cursor: "pointer",
          padding: 0,
          zIndex: 2,
        }}
      >
        {isFullscreen ? <IconExitFull /> : <IconFull />}
      </button>

      {shouldLoadIframe && isFullscreen && (
        <button
          type="button"
          onClick={() => setUnmuted((v) => !v)}
          className="font-mono"
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            background: unmuted
              ? "rgba(217, 106, 42, 0.85)"
              : "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(244, 236, 225, 0.35)",
            color: "var(--vault-paper)",
            fontSize: 11,
            letterSpacing: "0.22em",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          {unmuted ? <IconAudio /> : <IconMuted />}
          {unmuted ? "MUTE AUDIO" : "UNMUTE AUDIO"}
        </button>
      )}
    </div>
  );
}

function LoadGate({
  poster,
  title,
  kindLabel,
  weightLabel,
  ready,
  onLoad,
}: {
  poster?: string;
  title: string;
  kindLabel: string;
  weightLabel?: string;
  ready: boolean;
  onLoad: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 50%",
            opacity: 0.55,
            filter: "saturate(0.85)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.92) 80%)",
        }}
      />
      <div
        className="font-mono"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          color: "var(--vault-paper)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--vault-ember)",
          }}
        >
          ● {kindLabel} {weightLabel ? `· ${weightLabel.toUpperCase()}` : ""}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display), serif",
            fontStyle: "italic",
            fontSize: 22,
            letterSpacing: "-0.01em",
            color: "var(--vault-paper)",
            maxWidth: 380,
            lineHeight: 1.2,
          }}
        >
          Heavy frame, opt in to load.
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "rgba(244, 236, 225, 0.55)",
            maxWidth: 340,
            lineHeight: 1.5,
          }}
        >
          TAP BELOW TO LOAD · OR USE FULLSCREEN, TOP-RIGHT
        </div>
        <button
          type="button"
          onClick={onLoad}
          disabled={!ready}
          style={{
            marginTop: 6,
            padding: "12px 22px",
            background: "rgba(217, 106, 42, 0.18)",
            border: "1px solid rgba(217, 106, 42, 0.65)",
            color: "var(--vault-ember)",
            cursor: ready ? "pointer" : "not-allowed",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.26em",
            opacity: ready ? 1 : 0.4,
            transition: "background 180ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(217, 106, 42, 0.30)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(217, 106, 42, 0.18)";
          }}
          aria-label={`Load ${title}`}
        >
          LOAD THIS CONTENT
        </button>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

function IconFull() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 6 V2 H6" />
      <path d="M14 6 V2 H10" />
      <path d="M2 10 V14 H6" />
      <path d="M14 10 V14 H10" />
    </svg>
  );
}

function IconExitFull() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 2 V6 H2" />
      <path d="M10 2 V6 H14" />
      <path d="M6 14 V10 H2" />
      <path d="M10 14 V10 H14" />
    </svg>
  );
}

function IconAudio() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M3 6 H6 L10 3 V13 L6 10 H3 Z" />
      <path d="M12 6 Q14 8 12 10" />
    </svg>
  );
}

function IconMuted() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3 6 H6 L10 3 V13 L6 10 H3 Z" />
      <path d="M12 6 L15 9" />
      <path d="M15 6 L12 9" />
    </svg>
  );
}
