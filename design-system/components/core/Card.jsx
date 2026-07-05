import React from "react";

/** Card — the core surface. Soft radius, hairline border, low shadow. */
export function Card({
  children,
  padding = "var(--pad-card)",
  interactive = false,
  raised = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => interactive && setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        boxShadow: raised ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding,
        cursor: interactive ? "pointer" : "default",
        transform: press ? "scale(0.99)" : "scale(1)",
        boxShadow: hover && interactive ? "var(--shadow-md)" : (raised ? "var(--shadow-md)" : "var(--shadow-sm)"),
        borderColor: hover && interactive ? "var(--border-strong)" : "var(--border)",
        transition: "box-shadow .18s ease, border-color .18s ease, transform .08s ease",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
