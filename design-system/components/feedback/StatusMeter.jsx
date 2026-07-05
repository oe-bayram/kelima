import React from "react";

/**
 * StatusMeter — segmented bar showing the distribution of a chapter/library
 * across the 5 learning statuses. Segments use the status solid colors.
 */
const ORDER = ["secure", "known", "hard", "unknown", "new"];
const SOLID = {
  new: "var(--status-new-solid)",
  unknown: "var(--status-unknown-solid)",
  hard: "var(--status-hard-solid)",
  known: "var(--status-known-solid)",
  secure: "var(--status-secure-solid)",
};

export function StatusMeter({ counts = {}, height = 10, rounded = true, style }) {
  const total = ORDER.reduce((sum, k) => sum + (counts[k] || 0), 0) || 1;
  return (
    <div style={{ display: "flex", width: "100%", height, borderRadius: rounded ? "var(--r-full)" : 0, overflow: "hidden", background: "var(--surface-inset)", gap: 1.5, ...style }}>
      {ORDER.map((k) => {
        const w = ((counts[k] || 0) / total) * 100;
        if (w <= 0) return null;
        return <div key={k} style={{ width: `${w}%`, height: "100%", background: SOLID[k], transition: "width .4s ease" }} />;
      })}
    </div>
  );
}
