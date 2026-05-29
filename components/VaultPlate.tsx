import type { CSSProperties } from "react";
import { PlateImage } from "./PlateImage";

/**
 * Hover-aware photo frame.
 *  - Image scales on hover (+1.025x), tightens contrast.
 *  - Ember reticle fades in top-right.
 *  - Ember underline sweeps left→right.
 *  - Caption + plate-no overlay fades up from the bottom.
 */
export function VaultPlate({
  plateId,
  plateNo,
  caption = "EXAMINE",
  alt,
  position,
  style,
  className,
  priority,
  sizes,
}: {
  plateId: string;
  plateNo?: string;
  caption?: string;
  alt: string;
  position?: string;
  style?: CSSProperties;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`vault-plate ${className ?? ""}`} style={style}>
      <div style={{ position: "absolute", inset: 0 }}>
        <PlateImage
          id={plateId}
          alt={alt}
          position={position}
          priority={priority}
          sizes={sizes}
        />
      </div>
      <span className="vault-plate-reticle" aria-hidden />
      <span className="vault-plate-line" aria-hidden />
      {(plateNo || caption) && (
        <div className="vault-plate-meta">
          <span>{caption}</span>
          {plateNo && (
            <span style={{ color: "var(--vault-ember)" }}>PL. {plateNo} →</span>
          )}
        </div>
      )}
    </div>
  );
}
