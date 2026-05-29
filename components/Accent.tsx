/**
 * Italic-ember accent for the last word of an editorial headline.
 * `text="Industry, observed."` → "Industry, " + <em>observed.</em>
 * Pass `tail` to override the italic segment explicitly.
 */
export function Accent({
  text,
  tail,
  className,
}: {
  text: string;
  tail?: string;
  className?: string;
}) {
  let head = text;
  let accent = tail;
  if (!tail) {
    const words = text.split(" ");
    accent = words.slice(-1)[0];
    head = words.slice(0, -1).join(" ");
  }
  return (
    <span className={className}>
      {head}
      {head && " "}
      <em
        className="not-italic"
        style={{
          fontStyle: "italic",
          color: "var(--vault-ember)",
          fontWeight: "inherit",
        }}
      >
        {accent}
      </em>
    </span>
  );
}
