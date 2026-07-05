import React from "react";

/**
 * RatingButtons — the four self-assessment / examiner ratings used after each
 * card. Maps 1:1 to the status colors and the spaced-repetition intervals.
 */
const RATINGS = [
  { value: "unknown", label: "Nicht gewusst", due: "Gleich nochmal", fg: "var(--status-unknown-fg)", bg: "var(--status-unknown-bg)", border: "var(--status-unknown-border)", solid: "var(--status-unknown-solid)", icon: "x" },
  { value: "hard",    label: "Schwer",        due: "Morgen",         fg: "var(--status-hard-fg)",    bg: "var(--status-hard-bg)",    border: "var(--status-hard-border)",    solid: "var(--status-hard-solid)",    icon: "trending-down" },
  { value: "known",   label: "Kann ich",      due: "In 3 Tagen",     fg: "var(--status-known-fg)",   bg: "var(--status-known-bg)",   border: "var(--status-known-border)",   solid: "var(--status-known-solid)",   icon: "check" },
  { value: "secure",  label: "Sicher",        due: "In 7 Tagen",     fg: "var(--status-secure-fg)",  bg: "var(--status-secure-bg)",  border: "var(--status-secure-border)",  solid: "var(--status-secure-solid)",  icon: "check-check" },
];

export function RatingButtons({ onRate, showInterval = true, layout = "grid", style }) {
  const [press, setPress] = React.useState(null);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: layout === "grid" ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10,
        width: "100%",
        ...style,
      }}
    >
      {RATINGS.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onRate && onRate(r.value)}
          onMouseDown={() => setPress(r.value)}
          onMouseUp={() => setPress(null)}
          onMouseLeave={() => setPress(null)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
            padding: layout === "grid" ? "12px 14px" : "10px 8px",
            minHeight: 56,
            background: r.bg,
            color: r.fg,
            border: `1.5px solid ${r.border}`,
            borderRadius: "var(--r-md)",
            cursor: "pointer",
            textAlign: "left",
            transform: press === r.value ? "scale(0.97)" : "scale(1)",
            transition: "transform .08s ease, filter .15s ease",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7, font: "var(--text-body-strong)", fontSize: "var(--fs-body)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "var(--r-full)", background: r.solid, flex: "none" }} />
            {r.label}
          </span>
          {showInterval && (
            <span style={{ font: "var(--text-label)", fontSize: "var(--fs-micro)", opacity: 0.75, paddingLeft: 15 }}>{r.due}</span>
          )}
        </button>
      ))}
    </div>
  );
}
