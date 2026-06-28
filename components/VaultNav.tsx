"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type NavLink = { label: string; href: string };

const BRAND_LOGOS: { src: string; alt: string }[] = [
  { src: "/logos/praxivision.png",   alt: "Praxivision" },
  { src: "/logos/praxis-studio.png", alt: "Praxis Studio" },
];

const LINKS: NavLink[] = [
  { label: "Work",         href: "/" },
  { label: "Archive",      href: "/archive" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Studio",       href: "/studio" },
  { label: "Contact",      href: "/#contact" },
];

const PILL_THRESHOLD = 32;

export function VaultNav({ active = "Work" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const [brandIdx, setBrandIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setBrandIdx((i) => (i + 1) % BRAND_LOGOS.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > PILL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pill (scrolled): floating, glassmorphic, rounded, contracted
  // Flat (top): edge-to-edge, transparent
  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    top: scrolled ? 16 : 0,
    left: 0,
    right: 0,
    zIndex: 30,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    transition: "top 300ms ease",
  };

  const innerStyle: React.CSSProperties = {
    pointerEvents: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    width: scrolled ? "min(1080px, calc(100% - 24px))" : "100%",
    paddingTop:    scrolled ? 12 : 28,
    paddingBottom: scrolled ? 12 : 20,
    paddingLeft:   scrolled ? 24 : undefined,
    paddingRight:  scrolled ? 16 : undefined,
    borderRadius: scrolled ? 999 : 0,
    background: scrolled ? "rgba(12, 12, 12, 0.55)" : "transparent",
    backdropFilter: scrolled ? "blur(14px) saturate(150%)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(14px) saturate(150%)" : "none",
    border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
    boxShadow: scrolled
      ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "none",
    transition:
      "background 300ms ease, backdrop-filter 300ms ease, border-color 300ms ease, box-shadow 300ms ease, border-radius 300ms ease, padding 300ms ease, width 300ms ease",
  };

  return (
    <nav style={wrapperStyle}>
      <div className={scrolled ? undefined : "vault-pad"} style={innerStyle}>
        {/* Logo lock-up — cycles between Praxivision and Praxis Studio */}
        <Link
          href="/"
          aria-label="Praxivision · Praxis Studio"
          style={{
            textDecoration: "none",
            color: "var(--vault-paper)",
            display: "inline-block",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: scrolled ? 110 : 140,
              height: scrolled ? 28 : 36,
              transition: "width 300ms ease, height 300ms ease",
            }}
          >
            {BRAND_LOGOS.map((l, i) => (
              <Image
                key={l.src}
                src={l.src}
                alt={l.alt}
                fill
                sizes="140px"
                priority={i === 0}
                style={{
                  objectFit: "contain",
                  objectPosition: "left center",
                  opacity: i === brandIdx ? 1 : 0,
                  transition: "opacity 700ms ease-in-out",
                }}
              />
            ))}
          </div>
        </Link>

        {/* Desktop links */}
        <div
          className="font-mono hidden md:flex"
          style={{
            gap: scrolled ? 28 : 42,
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--vault-paper)",
            transition: "gap 300ms ease",
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="vault-link"
              data-active={l.label === active}
              style={{
                textDecoration: "none",
                color: l.label === active ? "var(--vault-ember)" : "var(--vault-paper)",
              }}
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden font-mono"
          aria-label="Menu"
          aria-expanded={open}
          style={{
            background: "transparent",
            border: `1px solid ${open ? "var(--vault-ember)" : "var(--vault-rule)"}`,
            color: open ? "var(--vault-ember)" : "var(--vault-paper)",
            padding: "8px 12px",
            fontSize: 10,
            letterSpacing: "0.28em",
            cursor: "pointer",
            borderRadius: scrolled ? 999 : 0,
            transition: "border-radius 300ms ease",
          }}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* Mobile sheet — outside the pill so it covers the screen */}
      {open && (
        <div
          className="md:hidden vault-pad"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "var(--vault-bg)",
            paddingTop: 96,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            zIndex: 25,
            pointerEvents: "auto",
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="vault-link"
              data-active={l.label === active}
              style={{
                textDecoration: "none",
                color: l.label === active ? "var(--vault-ember)" : "var(--vault-paper)",
                fontFamily: "var(--font-display), serif",
                fontWeight: 300,
                fontSize: 48,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
