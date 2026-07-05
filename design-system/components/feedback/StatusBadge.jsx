import React from "react";

/**
 * StatusBadge — the brand's learning-status indicator. Maps the 5 internal
 * states to German UI labels and the didactic color progression.
 */
const STATUS = {
  new:     { label: "Neu",          dot: "var(--status-new-solid)",     fg: "var(--status-new-fg)",     bg: "var(--status-new-bg)",     border: "var(--status-new-border)" },
  unknown: { label: "Nicht gewusst", dot: "var(--status-unknown-solid)", fg: "var(--status-unknown-fg)", bg: "var(--status-unknown-bg)", border: "var(--status-unknown-border)" },
  hard:    { label: "Schwer",       dot: "var(--status-hard-solid)",    fg: "var(--status-hard-fg)",    bg: "var(--status-hard-bg)",    border: "var(--status-hard-border)" },
  known:   { label: "Kann ich",     dot: "var(--status-known-solid)",   fg: "var(--status-known-fg)",   bg: "var(--status-known-bg)",   border: "var(--status-known-border)" },
  secure:  { label: "Sicher",       dot: "var(--status-secure-solid)",  fg: "var(--status-secure-fg)",  bg: "var(--status-secure-bg)",  border: "var(--status-secure-border)" },
};

export function StatusBadge({ status = "new", variant = "soft", size = "md", showLabel = true, style }) {
  const s = STATUS[status] || STATUS.new;
  const dims = size === "sm"
    ? { fs: "var(--fs-micro)", py: 2, px: 8, dot: 6 }
    : { fs: "var(--fs-label)", py: 4, px: 10, dot: 7 };

  if (variant === "dot") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--text-label)", color: "var(--text-secondary)", ...style }}>
        <span style={{ width: dims.dot + 1, height: dims.dot + 1, borderRadius: "var(--r-full)", background: s.dot, flex: "none" }} />
        {showLabel && s.label}
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: `${dims.py}px ${dims.px}px`,
        font: "var(--text-label)",
        fontSize: dims.fs,
        fontWeight: "var(--fw-semibold)",
        color: s.fg,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--r-full)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: dims.dot, height: dims.dot, borderRadius: "var(--r-full)", background: s.dot, flex: "none" }} />
      {showLabel && s.label}
    </span>
  );
}
