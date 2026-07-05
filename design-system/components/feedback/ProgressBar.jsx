import React from "react";

/** ProgressBar — single-value track. Default uses brand primary. */
export function ProgressBar({ value = 0, max = 100, height = 8, color = "var(--primary-500)", track = "var(--surface-inset)", style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width: "100%", height, background: track, borderRadius: "var(--r-full)", overflow: "hidden", ...style }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "var(--r-full)", transition: "width .4s cubic-bezier(.2,.7,.2,1)" }} />
    </div>
  );
}
