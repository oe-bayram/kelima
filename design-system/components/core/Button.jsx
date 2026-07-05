import React from "react";
import { Icon } from "./Icon.jsx";

/**
 * Button — primary action control. Variants map to the brand: solid pine-green
 * primary, quiet secondary, ghost, and danger.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  style,
  type = "button",
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const sizes = {
    sm: { h: 36, px: 14, fs: "var(--fs-label)", gap: 6, icon: 16 },
    md: { h: 46, px: 18, fs: "var(--fs-body)", gap: 8, icon: 18 },
    lg: { h: 54, px: 24, fs: "var(--fs-body-lg)", gap: 10, icon: 20 },
  }[size];

  const palettes = {
    primary: {
      bg: "var(--primary-500)", bgHover: "var(--primary-600)",
      fg: "var(--text-on-primary)", border: "transparent", shadow: "var(--shadow-sm)",
    },
    secondary: {
      bg: "var(--surface)", bgHover: "var(--surface-sunken)",
      fg: "var(--text-primary)", border: "var(--border-strong)", shadow: "var(--shadow-xs)",
    },
    ghost: {
      bg: "transparent", bgHover: "var(--surface-sunken)",
      fg: "var(--text-primary)", border: "transparent", shadow: "none",
    },
    danger: {
      bg: "var(--danger)", bgHover: "#A8322A",
      fg: "#fff", border: "transparent", shadow: "var(--shadow-sm)",
    },
  };
  const p = palettes[variant] || palettes.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.gap,
        height: sizes.h,
        padding: `0 ${sizes.px}px`,
        width: fullWidth ? "100%" : "auto",
        font: "var(--text-body-strong)",
        fontSize: sizes.fs,
        letterSpacing: "var(--ls-snug)",
        color: p.fg,
        background: hover && !isDisabled ? p.bgHover : p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: "var(--r-md)",
        boxShadow: p.shadow,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        transform: active && !isDisabled ? "scale(0.975)" : "scale(1)",
        transition: "background .15s ease, transform .08s ease, opacity .15s ease",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {loading && <Icon name="loader-circle" size={sizes.icon} style={{ animation: "lw-spin 0.8s linear infinite" }} />}
      {!loading && iconLeft && <Icon name={iconLeft} size={sizes.icon} />}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={sizes.icon} />}
      <style>{`@keyframes lw-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
