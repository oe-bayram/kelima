import React from "react";
import { Icon } from "./Icon.jsx";

/** IconButton — square, icon-only control. Used for TTS, favorite, close, nav. */
export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const dims = { sm: 36, md: 44, lg: 52 }[size];
  const iconSize = { sm: 18, md: 20, lg: 24 }[size];

  const palettes = {
    ghost: { bg: "transparent", bgHover: "var(--surface-sunken)", fg: "var(--text-secondary)", border: "transparent" },
    soft: { bg: "var(--surface-sunken)", bgHover: "var(--surface-inset)", fg: "var(--text-primary)", border: "transparent" },
    outline: { bg: "var(--surface)", bgHover: "var(--surface-sunken)", fg: "var(--text-primary)", border: "var(--border-strong)" },
  };
  const p = palettes[variant] || palettes.ghost;
  const activeStyle = active
    ? { background: "var(--primary-50)", color: "var(--primary-600)" }
    : {};

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dims,
        height: dims,
        borderRadius: "var(--r-md)",
        background: hover && !disabled ? p.bgHover : p.bg,
        color: p.fg,
        border: `1px solid ${p.border}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transform: press && !disabled ? "scale(0.92)" : "scale(1)",
        transition: "background .15s ease, transform .08s ease, color .15s ease",
        ...activeStyle,
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
