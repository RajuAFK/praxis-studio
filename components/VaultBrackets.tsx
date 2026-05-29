/** Four corner crop brackets. Lives inside any positioned ancestor. */
export function VaultBrackets({
  color = "var(--vault-ember)",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  const positions = [
    { top: 4, left: 4 },
    { top: 4, right: 4, transform: "rotate(90deg)" },
    { bottom: 4, left: 4, transform: "rotate(-90deg)" },
    { bottom: 4, right: 4, transform: "rotate(180deg)" },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          aria-hidden
          style={{
            position: "absolute",
            width: size,
            height: size,
            pointerEvents: "none",
            ...p,
          }}
        >
          <path
            d="M 0 0 L 16 0 M 0 0 L 0 16"
            stroke={color}
            strokeWidth="1.3"
            fill="none"
          />
        </svg>
      ))}
    </>
  );
}
