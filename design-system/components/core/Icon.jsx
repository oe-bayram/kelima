import React from "react";

/**
 * Icon — thin wrapper around Lucide. The host page must load Lucide
 * (https://unpkg.com/lucide@latest) once; this component renders the SVG and
 * keeps it correct across re-renders.
 *
 * In the React-Native app, use @expo/vector-icons equivalents instead — this
 * file documents the intended names/sizes/stroke weights.
 */
export function Icon({ name, size = 20, strokeWidth = 2, color = "currentColor", style, className }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    host.appendChild(i);
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({
        attrs: { width: size, height: size, "stroke-width": strokeWidth },
      });
    }
  }, [name, size, strokeWidth]);

  return (
    <span
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        color,
        flex: "none",
        ...style,
      }}
    />
  );
}
