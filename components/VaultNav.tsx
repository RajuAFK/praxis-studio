"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = { label: string; href: string };

const LINKS: NavLink[] = [
  { label: "Work",    href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "Studio",  href: "/studio" },
  { label: "Contact", href: "/#contact" },
];

export function VaultNav({ active = "Work" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <nav
      className="vault-pad"
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        paddingTop: 28, paddingBottom: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        zIndex: 30,
      }}
    >
      {/* Logo lock-up */}
      <Link
        href="/"
        style={{ textDecoration: "none", color: "var(--vault-paper)" }}
      >
        <div style={{ fontWeight: 500, fontSize: 18, letterSpacing: "-0.01em", lineHeight: 1 }}>
          Praxis
        </div>
      </Link>

      {/* Desktop links */}
      <div
        className="font-mono hidden md:flex"
        style={{ gap: 42, fontSize: 11, letterSpacing: "0.22em", color: "var(--vault-paper)" }}
      >
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="vault-link"
            data-active={l.label === active}
            style={{ textDecoration: "none", color: l.label === active ? "var(--vault-ember)" : "var(--vault-paper)" }}
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
        }}
      >
        {open ? "CLOSE" : "MENU"}
      </button>

      {/* Mobile sheet */}
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
