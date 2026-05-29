import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: "var(--vault-ember)",
        paper: "var(--vault-paper)",
        "paper-dim": "var(--vault-paper-dim)",
        rule: "var(--vault-rule)",
        canvas: "var(--vault-bg)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        "vault-mono": "0.22em",
        "vault-mono-wide": "0.28em",
        "vault-mono-x": "0.32em",
        "vault-tight": "-0.04em",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
