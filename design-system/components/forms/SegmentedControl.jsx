import React from "react";

/**
 * SegmentedControl — pill-track toggle. Used for card Tabs (Übersicht / Beispiele
 * / Formen / Grammatik) and chapter filters. Controlled via value/onChange.
 */
export function SegmentedControl({ options = [], value, onChange, size = "md", fullWidth = true, style }) {
  const dims = size === "sm"
    ? { h: 34, fs: "var(--fs-label)", px: 12 }
    : { h: 42, fs: "var(--fs-body)", px: 16 };
  return (
    <div
      style={{
        display: "inline-flex",
        width: fullWidth ? "100%" : "auto",
        padding: 4,
        gap: 2,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        ...style,
      }}
    >
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        const selected = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange && onChange(val)}
            style={{
              flex: fullWidth ? 1 : "none",
              height: dims.h,
              padding: `0 ${dims.px}px`,
              border: "none",
              borderRadius: "var(--r-sm)",
              cursor: "pointer",
              font: "var(--text-body-strong)",
              fontSize: dims.fs,
              color: selected ? "var(--text-primary)" : "var(--text-tertiary)",
              background: selected ? "var(--surface)" : "transparent",
              boxShadow: selected ? "var(--shadow-sm)" : "none",
              transition: "background .18s ease, color .18s ease, box-shadow .18s ease",
              whiteSpace: "nowrap",
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}
