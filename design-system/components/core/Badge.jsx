import React from "react";
import { Icon } from "./Icon.jsx";

/** Badge — small label for counts, categories, word types. Neutral by default. */
export function Badge({ children, tone = "neutral", icon, size = "md", style, ...rest }) {
  const tones = {
    neutral: { bg: "var(--surface-sunken)", fg: "var(--text-secondary)", border: "var(--border)" },
    primary: { bg: "var(--primary-50)", fg: "var(--primary-700)", border: "var(--primary-100)" },
    accent: { bg: "var(--accent-50)", fg: "var(--accent-600)", border: "var(--accent-100)" },
    outline: { bg: "transparent", fg: "var(--text-secondary)", border: "var(--border-strong)" },
  };
  const t = tones[tone] || tones.neutral;
  const dims = size === "sm"
    ? { fs: "var(--fs-micro)", py: 2, px: 7, icon: 12 }
    : { fs: "var(--fs-label)", py: 4, px: 10, icon: 14 };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: `${dims.py}px ${dims.px}px`,
        font: "var(--text-label)",
        fontSize: dims.fs,
        fontWeight: "var(--fw-semibold)",
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: "var(--r-full)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={dims.icon} />}
      {children}
    </span>
  );
}
