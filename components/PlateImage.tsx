import Image from "next/image";
import { plateUrl, hasPlateImage } from "@/lib/r2";

/**
 * Photograph from the R2 archive. Resolves to:
 *  - {R2_BASE}/plates/{id}.jpg when NEXT_PUBLIC_R2_BASE is set
 *  - /plates/{id}.jpg (local file in /public/plates) for known IDs in dev
 *  - a diagonal placeholder block otherwise (keeps the layout intact)
 */
export function PlateImage({
  id,
  alt,
  position = "50% 50%",
  priority,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  className,
}: {
  id: string;
  alt: string;
  position?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (!hasPlateImage(id)) {
    // Black tile with a faint ember diagonal — readable placeholder.
    return (
      <div
        aria-label={alt}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(135deg, #0c0c0c 0 24px, #111 24px 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--vault-paper-dim)",
          fontFamily: "var(--font-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.32em",
          textAlign: "center",
          padding: 12,
        }}
      >
        PLATE · {id.toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={plateUrl(id)}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit: "cover", objectPosition: position }}
    />
  );
}
