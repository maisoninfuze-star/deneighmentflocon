/**
 * Brand snowflake — redrawn as vector from the logo's six-point dendrite.
 * Used as the standalone mark in the nav, footer, dividers and loaders.
 */
export function Snowflake({
  className,
  strokeWidth = 7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Three primary axes, rotated 60° apart */}
        {[0, 60, 120].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <line x1="50" y1="8" x2="50" y2="92" />
            {/* Upper barbs */}
            <path d="M50 22 L38 12 M50 22 L62 12" />
            <path d="M50 40 L41 32 M50 40 L59 32" />
            {/* Lower barbs */}
            <path d="M50 78 L38 88 M50 78 L62 88" />
            <path d="M50 60 L41 68 M50 60 L59 68" />
          </g>
        ))}
      </g>
    </svg>
  );
}
