"use client";

import { useEffect, useState } from "react";
import {
  detectConnection,
  useMediaPreference,
} from "./MediaPreference";

/**
 * Splash gate shown the first time a visitor lands on the site in a tab.
 * Asks them to confirm their connection class before any heavy media is
 * fetched. The choice is persisted in sessionStorage so reloads don't
 * re-prompt.
 *
 * Pre-selection uses navigator.connection:
 *  - explicit cellular / slow effectiveType → highlight "Mobile" + warn
 *  - wifi / ethernet / fast 4g → highlight "WiFi / Ethernet"
 *  - API absent (Safari, Firefox) → neutral
 */
export function MediaGate() {
  const { preference, ready, setPreference } = useMediaPreference();
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState<"wifi" | "mobile" | "unknown">("unknown");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (preference) {
      setVisible(false);
      return;
    }
    setHint(detectConnection().hint);
    setExiting(false);
    setVisible(true);
  }, [ready, preference]);

  if (!visible) return null;

  const choose = (p: "wifi" | "mobile") => {
    setExiting(true);
    // Match the CSS transition duration before actually dismissing.
    setTimeout(() => {
      setPreference(p);
    }, 380);
  };

  const wifiPrimary = hint !== "mobile";
  const mobilePrimary = hint === "mobile";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-gate-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        opacity: exiting ? 0 : 1,
        transition: "opacity 360ms cubic-bezier(.2,.7,.3,1)",
        animation: exiting ? undefined : "media-gate-in 480ms cubic-bezier(.2,.7,.3,1)",
      }}
    >
      <style>{`
        @keyframes media-gate-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes media-gate-panel-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .media-gate-btn {
          position: relative;
          padding: 16px 22px;
          background: rgba(244, 236, 225, 0.04);
          border: 1px solid rgba(244, 236, 225, 0.20);
          color: var(--vault-paper);
          cursor: pointer;
          letter-spacing: 0.22em;
          font-size: 11px;
          text-align: left;
          transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
        }
        .media-gate-btn:hover {
          background: rgba(244, 236, 225, 0.08);
          border-color: rgba(244, 236, 225, 0.40);
        }
        .media-gate-btn:active { transform: translateY(1px); }
        .media-gate-btn.primary {
          background: rgba(217, 106, 42, 0.16);
          border-color: rgba(217, 106, 42, 0.55);
          color: var(--vault-ember);
        }
        .media-gate-btn.primary:hover {
          background: rgba(217, 106, 42, 0.24);
        }
        .media-gate-btn .label {
          display: block;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .media-gate-btn .sub {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: rgba(244, 236, 225, 0.55);
          text-transform: uppercase;
        }
        .media-gate-btn.primary .sub { color: rgba(217, 106, 42, 0.8); }
      `}</style>

      <div
        className="font-mono"
        style={{
          maxWidth: 640,
          width: "100%",
          padding: "44px 36px 36px",
          border: "1px solid rgba(244, 236, 225, 0.16)",
          background: "rgba(8, 8, 6, 0.85)",
          animation: "media-gate-panel-in 520ms cubic-bezier(.2,.7,.3,1)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--vault-ember)",
            marginBottom: 18,
          }}
        >
          ● PRAXIS · MEDIA ADVISORY
        </div>
        <h2
          id="media-gate-title"
          style={{
            fontFamily: "var(--font-display), serif",
            fontWeight: 300,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            margin: 0,
            color: "var(--vault-paper)",
          }}
        >
          Heavy archive.
          <br />
          <span style={{ fontStyle: "italic", color: "var(--vault-ember)" }}>
            Pick your lane.
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontFamily: "var(--font-display), serif",
            fontSize: 16,
            lineHeight: 1.6,
            color: "rgba(244, 236, 225, 0.78)",
            letterSpacing: 0,
          }}
        >
          This site carries heavyweight media — 360° tours, gigapixel plates,
          three-dimensional captures. Files are compressed 50–90% for the
          browser, but a WiFi or Ethernet connection is strongly recommended.
          Mobile networks may struggle with the file sizes.
        </p>

        <div
          style={{
            marginTop: 30,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <button
            type="button"
            className={`media-gate-btn ${wifiPrimary ? "primary" : ""}`}
            onClick={() => choose("wifi")}
          >
            <span className="label">I&apos;m on WiFi / Ethernet</span>
            <span className="sub">Full quality · all media loads</span>
          </button>
          <button
            type="button"
            className={`media-gate-btn ${mobilePrimary ? "primary" : ""}`}
            onClick={() => choose("mobile")}
          >
            <span className="label">Continue on mobile data</span>
            <span className="sub">Heavy frames load on tap only</span>
          </button>
        </div>

        {hint !== "unknown" && (
          <div
            style={{
              marginTop: 18,
              fontSize: 9,
              letterSpacing: "0.28em",
              color: hint === "mobile" ? "rgba(217,106,42,0.8)" : "rgba(244,236,225,0.45)",
            }}
          >
            ● DETECTED · {hint === "wifi" ? "BROADBAND-CLASS LINK" : "CELLULAR / SLOW LINK"}
          </div>
        )}
      </div>
    </div>
  );
}
