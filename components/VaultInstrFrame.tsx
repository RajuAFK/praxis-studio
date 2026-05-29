import type { CSSProperties, ReactNode } from "react";
import { VaultBrackets } from "./VaultBrackets";

/** Frame with corner brackets + top/bottom metadata strips. Wraps any media. */
export function VaultInstrFrame({
  children,
  label,
  code,
  exposure,
  scale,
  style,
  className,
}: {
  children: ReactNode;
  label?: string;
  code?: string;
  exposure?: string;
  scale?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {children}
      <VaultBrackets />
      {(label || code) && (
        <div
          className="font-mono"
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--vault-paper)",
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "var(--vault-ember)" }}>◉ {label}</span>
          {code && <span style={{ opacity: 0.85 }}>{code}</span>}
        </div>
      )}
      {(exposure || scale) && (
        <div
          className="font-mono"
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--vault-paper)",
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          <span style={{ opacity: 0.85 }}>{exposure}</span>
          {scale && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 1,
                  background: "var(--vault-ember)",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: -3,
                    width: 1,
                    height: 7,
                    background: "var(--vault-ember)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    top: -3,
                    width: 1,
                    height: 7,
                    background: "var(--vault-ember)",
                  }}
                />
              </div>
              <span>{scale}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
